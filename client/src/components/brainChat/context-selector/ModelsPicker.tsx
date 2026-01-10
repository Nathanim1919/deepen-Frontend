import { useEffect, useState } from "react";
import { useBrainStore, type OpenRouterModel } from "../../../stores/brain-store";
import { useSettingsStore, AUTO_MODEL_ID, getAvailableModels, isModelFree } from "../../../stores/settings-store";
import { Bot, Check, Zap, Search } from "lucide-react";

type ModelsPickerProps = {
    // Optional: for settings page to set default model instead of conversation model
    mode?: "conversation" | "default";
    onSelect?: (model: OpenRouterModel | null) => void;
};

export const ModelsPicker = ({ mode = "conversation", onSelect }: ModelsPickerProps) => {
    const { modelList, selectedModel, setSelectedModel, getModelList } = useBrainStore();
    const { defaultModelId, setDefaultModelId, isPro } = useSettingsStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        getModelList();
    }, []);

    // Get available models based on subscription
    const availableModels = getAvailableModels(modelList, isPro);

    // Filter models by search query
    const filteredModels = availableModels.filter(
        (model) =>
            model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Determine which model is currently active based on mode
    const activeModelId = mode === "default" 
        ? defaultModelId 
        : (selectedModel?.id || defaultModelId);

    const handleSelectModel = (model: OpenRouterModel | null, modelId: string) => {
        if (mode === "default") {
            setDefaultModelId(modelId);
        } else {
            if (model) {
                setSelectedModel(model);
            }
        }
        onSelect?.(model);
    };

    return (
        <div>
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-100 dark:bg-[#141416]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-gray-700 text-black dark:text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Auto Option - Only for Pro users */}
            {isPro && (
                <button
                    className={`flex text-sm items-center w-full hover:opacity-65 gap-2 dark:border-[#131212] cursor-pointer px-3 py-2 border-b border-gray-200 text-left transition ${
                        activeModelId === AUTO_MODEL_ID ? "bg-gray-100 dark:bg-[#131212] text-blue-500" : ""
                    }`}
                    onClick={() => handleSelectModel({ id: AUTO_MODEL_ID, name: "Auto (Fastest)" } as OpenRouterModel, AUTO_MODEL_ID)}
                >
                    {activeModelId === AUTO_MODEL_ID ? (
                        <Check className="text-blue-500 size-4" />
                    ) : (
                        <Zap className="text-yellow-500 size-4" />
                    )}
                    <span className="flex-1">Auto (Fastest)</span>
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs">
                        Recommended
                    </span>
                </button>
            )}

            {/* Model List */}
            {filteredModels.map((model) => (
                <button
                    className={`flex text-sm items-center w-full hover:opacity-65 gap-2 dark:border-[#131212] cursor-pointer px-3 py-2 border-b border-gray-200 text-left transition ${
                        activeModelId === model.id ? "bg-gray-100 dark:bg-[#131212] text-blue-500" : ""
                    }`}
                    key={model.id}
                    onClick={() => handleSelectModel(model, model.id)}
                >
                    {activeModelId === model.id ? (
                        <Check className="text-blue-500 size-4" />
                    ) : (
                        <Bot className="text-gray-500 size-4 dark:text-gray-600" />
                    )}
                    <span className="flex-1 truncate">{model.name || model.id}</span>
                    {isModelFree(model.pricing) && (
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs">
                            Free
                        </span>
                    )}
                </button>
            ))}

            {filteredModels.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No models found
                </div>
            )}
        </div>
    );
}