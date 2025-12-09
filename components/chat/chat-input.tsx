"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import qs from "query-string";
import axios from "axios";
import { useModal } from "../hooks/user-model-store";
import { EmojiPicker } from "../emoji-picker";
import { Gift, Plus } from "lucide-react";

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  type: "conversation" | "channel";
}

const formSchema = z.object({
  content: z.string().min(1),
});

const PERSPECTIVE_API_KEY = process.env.NEXT_PUBLIC_PERSPECTIVE_API_KEY;

// Check toxic in background - không block gửi tin nhắn
const checkToxicAsync = async (text: string): Promise<{ toxicity: number; spam: number }> => {
  try {
    const response = await axios.post(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
      {
        comment: { text },
        languages: ["en", "vi"],
        requestedAttributes: {
          TOXICITY: {},
          SPAM: {},
        },
      },
      { timeout: 3000 } // Timeout 3s
    );

    const toxicity = response.data.attributeScores?.TOXICITY?.summaryScore?.value || 0;
    const spam = response.data.attributeScores?.SPAM?.summaryScore?.value || 0;

    return { toxicity, spam };
  } catch (err) {
    console.error("Perspective API error:", err);
    return { toxicity: 0, spam: 0 };
  }
};

export const ChatInput = ({ apiUrl, query, name, type }: ChatInputProps) => {
  const { onOpen } = useModal();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Gửi tin nhắn ngay lập tức - socket sẽ update UI
      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });
      
      // Reset form ngay để UX tốt hơn
      form.reset();
      
      // Gửi tin nhắn
      await axios.post(url, values);
      
      // Check toxic trong background (không block)
      checkToxicAsync(values.content).then(({ toxicity, spam }) => {
        if (toxicity > 0.7 || spam > 0.7) {
          console.warn("Toxic/spam message detected:", { toxicity, spam });
          // Có thể implement: xóa tin nhắn hoặc flag nó
        }
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative px-4 pb-6 pt-4">
                  <button
                    type="button"
                    onClick={() => onOpen("messageFile", { apiUrl, query })}
                    className="absolute top-1/2 -translate-y-1/2 left-8 h-6 w-6 bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                  >
                    <Plus className="text-white dark:text-[#313338] h-4 w-4" />
                  </button>
                  <Input
                    disabled={isLoading}
                    placeholder={`Message ${
                      type === "conversation" ? name : "#" + name
                    }`}
                    {...field}
                    className="pl-14 pr-24 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 right-8 flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => onOpen("payment")}
                      className="hover:opacity-75 transition"
                    >
                      <Gift className="h-5 w-5 text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 transition" />
                    </button>
                    <EmojiPicker
                      onChange={(emoji: string) =>
                        field.onChange(`${field.value} ${emoji}`)
                      }
                    />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ChatInput;
