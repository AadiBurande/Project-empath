// src/pages/SettingsPage.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    facialSensitivity: 80,
    audioThreshold: 65,
    textBias: 50,
    insightTone: "Empathetic",
  });

  const handleSliderChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: Number(value) }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-grow flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8">
          <div className="max-w-2xl bg-white rounded-2xl shadow-xs border border-slate-200 p-8">
            <h1 className="text-2xl font-bold mb-6 text-slate-900">
              Multimodal Model & Interface Settings
            </h1>

            <div className="space-y-6">
              <div className="py-4 border-b border-slate-100">
                <label className="font-semibold text-sm text-slate-900">Facial Model Sensitivity</label>
                <p className="text-xs text-slate-500 mb-3">Adjust ONNX FER+ detection threshold for subtle facial expressions.</p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.facialSensitivity}
                  onChange={(e) => handleSliderChange("facialSensitivity", e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="py-4 border-b border-slate-100">
                <label className="font-semibold text-sm text-slate-900">AI Response Tone</label>
                <select
                  value={settings.insightTone}
                  onChange={(e) => setSettings({ ...settings, insightTone: e.target.value })}
                  className="w-full p-2.5 mt-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="Empathetic">Empathetic & Warm (Default)</option>
                  <option value="Professional">Professional Clinical</option>
                  <option value="Encouraging">Motivational & Encouraging</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => alert("Settings saved!")}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default SettingsPage;
