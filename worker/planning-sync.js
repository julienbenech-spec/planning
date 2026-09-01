const DEFAULT_OWNER = "julienbenech-spec";
const DEFAULT_REPO = "planning";
const DEFAULT_BRANCH = "main";
const DEFAULT_PATH = "data/planning-data.json";

function corsHeaders(env){
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

function jsonResponse(env, body, init = {}){
  return new Response(JSON.stringify(body), {
    status: init.status || 200,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(env),
      ...(init.headers || {})
    }
  });
}

function githubFileUrl(env){
  const owner = env.GITHUB_OWNER || DEFAULT_OWNER;
  const repo = env.GITHUB_REPO || DEFAULT_REPO;
  const path = encodeURIComponent(env.GITHUB_PATH || DEFAULT_PATH).replace(/%2F/g, "/");
  return "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + path;
}

function githubHeaders(env){
  return {
    Accept: "application/vnd.github+json",
    Authorization: "Bearer " + env.GITHUB_TOKEN,
    "User-Agent": "planning-sync-worker"
  };
}

function encodeContent(text){
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function decodeContent(text){
  const binary = atob(String(text || "").replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function assertWriteAccess(request, env){
  if (!env.TEAM_WRITE_KEY) return true;
  const expected = "Bearer " + env.TEAM_WRITE_KEY;
  return request.headers.get("Authorization") === expected;
}

async function readGithubSnapshot(env){
  const branch = env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const res = await fetch(githubFileUrl(env) + "?ref=" + encodeURIComponent(branch), {
    headers: githubHeaders(env),
    cache: "no-store"
  });
  if (!res.ok) throw new Error("GitHub read failed: " + res.status);
  const meta = await res.json();
  return {
    sha: meta.sha || "",
    snapshot: JSON.parse(decodeContent(meta.content || ""))
  };
}

async function writeGithubSnapshot(env, snapshot){
  const current = await readGithubSnapshot(env).catch(() => ({sha: ""}));
  const res = await fetch(githubFileUrl(env), {
    method: "PUT",
    headers: {
      ...githubHeaders(env),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Autosave planning " + new Date().toISOString(),
      content: encodeContent(JSON.stringify(snapshot, null, 2)),
      branch: env.GITHUB_BRANCH || DEFAULT_BRANCH,
      ...(current.sha ? {sha: current.sha} : {})
    })
  });
  if (!res.ok) throw new Error("GitHub write failed: " + res.status);
  return res.json();
}

export default {
  async fetch(request, env){
    if (request.method === "OPTIONS") return new Response(null, {status: 204, headers: corsHeaders(env)});

    if (!env.GITHUB_TOKEN) {
      return jsonResponse(env, {error: "GITHUB_TOKEN is not configured"}, {status: 500});
    }

    const url = new URL(request.url);
    if (url.pathname !== "/snapshot") {
      return jsonResponse(env, {error: "Not found"}, {status: 404});
    }

    try{
      if (request.method === "GET"){
        const {snapshot} = await readGithubSnapshot(env);
        return jsonResponse(env, snapshot);
      }

      if (request.method === "PUT"){
        if (!assertWriteAccess(request, env)) {
          return jsonResponse(env, {error: "Unauthorized"}, {status: 401});
        }
        const snapshot = await request.json();
        await writeGithubSnapshot(env, snapshot);
        return jsonResponse(env, {ok: true});
      }

      return jsonResponse(env, {error: "Method not allowed"}, {status: 405});
    }catch(error){
      return jsonResponse(env, {error: String(error && error.message ? error.message : error)}, {status: 502});
    }
  }
};
