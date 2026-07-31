import { ref, onBeforeUnmount, type Ref } from "vue";

type WsOptions = {
  onmessage?: (msg: string) => void;
  /** 断线后自动重连间隔，默认 3000ms；传 0 关闭自动重连 */
  reconnectMs?: number;
};

export function useWebSocket(url: string, options: WsOptions = {}) {
  const ws: Ref<WebSocket | null> = ref(null);
  const messages = ref<string[]>([]);
  const status = ref<"disconnected" | "connecting" | "connected">("disconnected");

  const reconnectMs = options.reconnectMs ?? 3000;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let intentionalClose = false;

  function clearReconnect() {
    if (reconnectTimer != null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function connect() {
    clearReconnect();
    intentionalClose = false;
    status.value = "connecting";

    const socket = new WebSocket(url);
    ws.value = socket;

    socket.onopen = () => {
      status.value = "connected";
    };

    socket.onmessage = (event: MessageEvent) => {
      const data = typeof event.data === "string" ? event.data : String(event.data);
      messages.value.push(data);
      options.onmessage?.(data);
    };

    socket.onclose = () => {
      status.value = "disconnected";
      ws.value = null;
      if (!intentionalClose && reconnectMs > 0) {
        reconnectTimer = setTimeout(connect, reconnectMs);
      }
    };

    socket.onerror = () => {
      // onclose 会随后触发，在此仅关闭以进入重连流程
      try {
        socket.close();
      } catch {
        /* ignore */
      }
    };
  }

  function sendMessage(command: { type?: string; [key: string]: unknown }) {
    if (ws.value?.readyState === WebSocket.OPEN && command?.type) {
      ws.value.send(JSON.stringify(command));
    }
  }

  function closeWS() {
    intentionalClose = true;
    clearReconnect();
    ws.value?.close();
    ws.value = null;
    status.value = "disconnected";
  }

  connect();

  onBeforeUnmount(() => {
    closeWS();
  });

  return { ws, messages, status, sendMessage, closeWS };
}
