import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react-native';

type ToastTone = 'error' | 'success' | 'info';
type ToastMessage = { title: string; message?: string; tone: ToastTone };
type ToastContextValue = { showToast: (title: string, message?: string, tone?: ToastTone) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback((title: string, message?: string, tone: ToastTone = 'error') => {
    if (timeout.current) clearTimeout(timeout.current);
    setToast({ title, message, tone });
    timeout.current = setTimeout(() => {
      setToast(null);
      timeout.current = null;
    }, 3500);
  }, []);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  const Icon = toast?.tone === 'success' ? CheckCircle2 : toast?.tone === 'info' ? Info : CircleAlert;
  const accent = toast?.tone === 'success' ? '#25845A' : toast?.tone === 'info' ? '#4351A5' : '#BD4D4D';

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View className="flex-1">{children}</View>
      {toast ? (
        <Pressable
          accessibilityRole="alert"
          onPress={dismiss}
          className="absolute bottom-5 left-4 right-4 z-50 self-center"
          style={{ maxWidth: 440 }}
        >
          <View className="min-h-[60px] flex-row items-center rounded-[16px] border border-[#E8EAF0] bg-white px-4 py-3" style={{ elevation: 8 }}>
            <Icon color={accent} size={22} />
            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-semibold text-[#202638]">{toast.title}</Text>
              {toast.message ? (
                <Text className="mt-1 text-[13px] leading-[18px] text-[#626A79]">{toast.message}</Text>
              ) : null}
            </View>
            <X color="#7C8494" size={18} />
          </View>
        </Pressable>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context.showToast;
}
