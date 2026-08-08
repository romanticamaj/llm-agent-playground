// Live teaser 註冊表 — 概念頁上常駐播放的 micro-animation
// 自訂 teaser 覆蓋 Ch1/Ch2（授課主線）；其餘用 _generic
import generic from './_generic.js'

const custom = {
  'next-token-prediction': () => import('./next-token-prediction.js'),
  'deterministic-vs-nondeterministic': () => import('./deterministic-vs-nondeterministic.js'),
  'llm-stateless': () => import('./llm-stateless.js'),
  'context-window': () => import('./context-window.js'),
  'choose-your-brain': () => import('./choose-your-brain.js'),
  'compaction': () => import('./compaction.js'),
  'context-pollution-rewind': () => import('./context-pollution-rewind.js'),
  'prompt-cache': () => import('./prompt-cache.js'),
  'agent-anatomy': () => import('./agent-anatomy.js'),
  'tool-use': () => import('./tool-use.js'),
  'new-signals': () => import('./new-signals.js'),
  'skill': () => import('./skill.js'),
  'project-prefix': () => import('./project-prefix.js'),
  'product-map': () => import('./product-map.js'),
  'output-format': () => import('./output-format.js'),
  'tool-verification': () => import('./tool-verification.js'),
  'chase-concepts': () => import('./chase-concepts.js'),
  'prompt-builder': () => import('./prompt-builder.js'),
  'mcp': () => import('./mcp.js'),
  'permission-boundary': () => import('./permission-boundary.js'),
  'agent-eval': () => import('./agent-eval.js'),
  'verification-friction': () => import('./verification-friction.js'),
  'eight-levels': () => import('./eight-levels.js'),
  'vampire-gremlin': () => import('./vampire-gremlin.js'),
  'taste': () => import('./taste.js'),
  'memory-map': () => import('./memory-map.js'),
  'self-improving-agent': () => import('./self-improving-agent.js'),
  'agent-vs-workflow': () => import('./agent-vs-workflow.js'),
  'hooks': () => import('./hooks.js'),
  'harness': () => import('./harness.js'),
  'sub-agents': () => import('./sub-agents.js'),
  'agent-communication': () => import('./agent-communication.js'),
  'long-running-agent': () => import('./long-running-agent.js'),
  'first-pass-acceptance': () => import('./first-pass-acceptance.js'),
  'relocating-rigor': () => import('./relocating-rigor.js'),
  'agentic-engineering': () => import('./agentic-engineering.js'),
  'cognitive-load': () => import('./cognitive-load.js'),
  'data-literacy': () => import('./data-literacy.js'),
  'round-robin': () => import('./round-robin.js'),
  'access-spectrum': () => import('./access-spectrum.js'),
  'subscription-vs-api-key': () => import('./subscription-vs-api-key.js'),
  'execution-environment': () => import('./execution-environment.js'),
}

export async function loadTeaser(id) {
  const loader = custom[id]
  if (!loader) return generic
  try {
    const mod = await loader()
    return mod.default || generic
  } catch {
    return generic
  }
}
