import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Octokit } from '@octokit/rest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'shenre-0215';
const REPO = 'xinjie-app';
const BRANCH = 'gh-pages';

if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function uploadFile(filePath, githubPath) {
  const content = fs.readFileSync(filePath, 'base64');
  try {
    const existing = await octokit.rest.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: githubPath,
      ref: BRANCH
    }).catch(() => null);
    
    const params = {
      owner: OWNER,
      repo: REPO,
      path: githubPath,
      message: `Deploy: update ${githubPath}`,
      content: content,
      branch: BRANCH
    };
    
    if (existing && existing.data && Array.isArray(existing.data)) {
      params.sha = existing.data.find(f => f.path === githubPath)?.sha;
    } else if (existing && existing.data && existing.data.sha) {
      params.sha = existing.data.sha;
    }
    
    await octokit.rest.repos.createOrUpdateFileContents(params);
    console.log(`✅ Uploaded: ${githubPath}`);
  } catch (error) {
    console.error(`❌ Failed to upload ${githubPath}:`, error.message);
    throw error;
  }
}

async function createBranchIfNeeded() {
  try {
    await octokit.rest.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`
    });
    return;
  } catch {
    console.log(`Creating branch: ${BRANCH}`);
  }
  
  let baseRef;
  try {
    baseRef = await octokit.rest.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: 'heads/main'
    });
  } catch {
    const emptyTree = await octokit.rest.git.createTree({
      owner: OWNER,
      repo: REPO,
      tree: []
    });
    const commit = await octokit.rest.git.createCommit({
      owner: OWNER,
      repo: REPO,
      message: 'Initial commit',
      tree: emptyTree.data.sha
    });
    await octokit.rest.git.createRef({
      owner: OWNER,
      repo: REPO,
      ref: 'refs/heads/main',
      sha: commit.data.sha
    });
    
    baseRef = await octokit.rest.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: 'heads/main'
    });
  }
  
  await octokit.rest.git.createRef({
    owner: OWNER,
    repo: REPO,
    ref: `refs/heads/${BRANCH}`,
    sha: baseRef.data.object.sha
  });
  
  console.log(`Created branch: ${BRANCH}`);
}

async function deploy() {
  console.log('🚀 Starting deployment to GitHub Pages...');
  
  await createBranchIfNeeded();
  
  const filesToUpload = [];
  
  function collectFiles(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativePath = prefix ? `${prefix}/${item}` : item;
      
      if (fs.statSync(fullPath).isDirectory()) {
        collectFiles(fullPath, relativePath);
      } else {
        filesToUpload.push({ local: fullPath, remote: relativePath });
      }
    });
  }
  
  collectFiles(distDir);
  
  console.log(`📦 Found ${filesToUpload.length} files to upload`);
  
  for (const file of filesToUpload) {
    await uploadFile(file.local, file.remote);
  }
  
  await octokit.rest.repos.update({
    owner: OWNER,
    repo: REPO,
    pages: {
      source: {
        branch: BRANCH,
        path: '/'
      }
    }
  });
  
  console.log('\n🎉 Deployment completed!');
  console.log(`🌐 URL: https://${OWNER}.github.io/${REPO}/`);
}

deploy().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});