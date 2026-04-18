"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage, QUICK_QUESTIONS, API_PROVIDERS, getAIConfig, saveAIConfig } from "@/lib/api/aiAssistant";
import { loadProfile } from "@/lib/storage";
import { BODY_TAG_CN } from "@/lib/labels";
import type { BodyProfile } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<BodyProfile | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState(getAIConfig);
  const [apiKey, setApiKey] = useState(config.apiKey || "");
  const [selectedModel, setSelectedModel] = useState(config.model || "");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setConfig(getAIConfig());
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSend(userInput?: string) {
    const text = userInput || input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    // 先把用户消息添加到历史
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const profileData = profile || loadProfile();
      // 使用包含最新消息的历史
      const history = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendMessage(history, {
        height: profileData.heightCm,
        weight: profileData.weightKg,
        bodyTags: profileData.bodyTags,
        styleLikes: profileData.styleLikes,
        avoidFabrics: profileData.avoidFabrics,
        usualSize: profileData.usualSize,
      });

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "发送消息失败";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleQuickQuestion(query: string) {
    handleSend(query);
  }

  function saveSettings() {
    const newConfig = {
      provider: config.provider,
      apiKey: apiKey.trim() || undefined,
      model: selectedModel || undefined,
    };
    saveAIConfig(newConfig);
    setConfig(newConfig);
    setShowSettings(false);
  }

  const currentProvider = API_PROVIDERS.find((p) => p.id === config.provider);

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col">
      {/* 头部 */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-violet-950">AI 穿搭助手</h1>
          <p className="mt-1 text-sm text-stone-600">
            用自然语言询问穿搭建议，AI 根据你的身材特点给出个性化推荐
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-900 shadow-sm hover:bg-violet-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          AI 设置
        </button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="mb-4 rounded-2xl border border-violet-200 bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold text-violet-950">AI 配置</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-violet-900">AI 服务商</label>
              <select
                className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2"
                value={config.provider}
                onChange={(e) => {
                  const newProvider = e.target.value as typeof config.provider;
                  setConfig({ ...config, provider: newProvider });
                  const provider = API_PROVIDERS.find((p) => p.id === newProvider);
                  setSelectedModel(provider?.models[0] || "");
                }}
              >
                {API_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-violet-900">模型</label>
              <select
                className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {(currentProvider?.models || []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-violet-900">API Key（可选）</label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`输入 ${currentProvider?.name} API Key`}
              />
              {currentProvider?.signupUrl && (
                <a
                  href={currentProvider.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-xs text-violet-600 underline"
                >
                  去 {currentProvider.name} 获取 API Key →
                </a>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => setShowSettings(false)}
              className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-medium text-violet-900 hover:bg-violet-50"
            >
              取消
            </button>
            <button
              onClick={saveSettings}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-300/70"
            >
              保存配置
            </button>
          </div>
        </div>
      )}

      {/* 身材信息提示 */}
      {profile && profile.bodyTags.length > 0 && (
        <div className="mb-4 rounded-xl bg-violet-50/80 p-3 text-xs text-violet-900">
          <span className="font-semibold">当前身材档案：</span>
          {profile.bodyTags.map((t) => BODY_TAG_CN[t] || t).join("、")} · {profile.heightCm}cm · {profile.weightKg}kg
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-violet-100 bg-white/50 p-4 shadow-soft">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 text-5xl">👗</div>
            <h2 className="mb-2 text-xl font-semibold text-violet-950">AI 穿搭助手</h2>
            <p className="mb-6 max-w-md text-sm text-stone-600">
              我是你的专属穿搭顾问！告诉我你的身材特点、喜欢的风格或想去的场合，我来帮你搭配！
            </p>

            {/* 快捷问题 */}
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => handleQuickQuestion(q.query)}
                  className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm text-violet-900 shadow-sm ring-violet-200 hover:bg-violet-50 hover:ring-2"
                >
                  <span>{q.icon}</span>
                  <span>{q.label}</span>
                </button>
              ))}
            </div>

            {/* 示例问题 */}
            <div className="mt-8 max-w-md text-left">
              <p className="mb-2 text-xs font-medium text-stone-500">试试这样问：</p>
              <ul className="space-y-1 text-xs text-stone-600">
                <li>• 「我是梨形身材，胯宽怎么穿显瘦？」</li>
                <li>• 「小个子通勤穿什么单品好？」</li>
                <li>• 「约会约会有什么显白颜色推荐？」</li>
                <li>• 「帮我推荐一套面试穿搭」</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white"
                      : "bg-white text-stone-700 shadow-sm ring-violet-100"
                  }`}
                  style={msg.role === "assistant" ? { boxShadow: "0 2px 8px rgba(139, 92, 246, 0.1)" } : {}}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={`mt-1 text-xs ${
                      msg.role === "user" ? "text-white/70" : "text-stone-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("zh-CN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-violet-100">
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span>AI 正在思考...</span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-red-200">
                  <p className="font-medium">调用失败</p>
                  <p className="mt-1 text-red-500">{error}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="mt-4 flex gap-3">
        <textarea
          ref={inputRef}
          className="flex-1 resize-none rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm outline-none ring-violet-200 focus:ring-2"
          placeholder="输入你的穿搭问题..."
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="flex h-auto items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-400/60 disabled:opacity-50"
        >
          {loading ? (
            <span>发送中</span>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              发送
            </>
          )}
        </button>
      </div>
    </div>
  );
}
