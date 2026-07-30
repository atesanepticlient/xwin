// hooks/useSSEStream.ts
import { useEffect, useRef, useCallback } from "react";

interface SSEOptions {
  onData?: (data: any) => void;
  onUpdate?: (data: any) => void;
  onError?: (error: any) => void;
  onComplete?: (data: any) => void;
  onStart?: (data: any) => void;
}

export const useSSEStream = (url: string, options: SSEOptions = {}) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    // Prevent multiple connections
    if (isConnectedRef.current) return;

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      // Handle initial data
      eventSource.addEventListener("start", (event) => {
        isConnectedRef.current = true;
        const data = JSON.parse(event.data);
        options.onStart?.(data);
      });

      // Handle initial data load
      eventSource.addEventListener("data", (event) => {
        const data = JSON.parse(event.data);
        options.onData?.(data);
      });

      // Handle periodic updates
      eventSource.addEventListener("update", (event) => {
        const data = JSON.parse(event.data);
        options.onUpdate?.(data);
      });

      // Handle completion
      eventSource.addEventListener("complete", (event) => {
        const data = JSON.parse(event.data);
        options.onComplete?.(data);
        disconnect();
      });

      // Handle errors
      eventSource.addEventListener("error", (event) => {
        const data = JSON.parse(event.data);
        options.onError?.(data);
      });

      // Handle connection errors
      eventSource.onerror = () => {
        console.error("EventSource error");
        disconnect();
      };
    } catch (error) {
      console.error("Failed to connect to SSE:", error);
      options.onError?.(error);
    }
  }, [url, options]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    disconnect,
    reconnect: connect,
  };
};
