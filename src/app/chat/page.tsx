"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
  edited_at: string | null;
  message_type: "text" | "image" | "video" | "system";
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  order_id: string | null;
};

type Profile = {
  id: string;
  username: string | null;
  profile_id: string | null;
  avatar_url: string | null;
};

type ChatItem = {
  userId: string;
  profile: Profile | null;
  lastMessage: Message;
  unreadCount: number;
};

type MediaViewer = {
  type: "image" | "video";
  url: string;
};

type Position = {
  x: number;
  y: number;
};

const EMOJI_LIST = [
  "😀", "😁", "😂", "🤣", "😃", "😄",
  "😅", "😆", "😉", "😊", "😋", "😍",
  "🥰", "😘", "😎", "🤔", "😢", "😭",
  "😡", "🤬", "👍", "👎", "❤️", "🔥",
  "🎮", "🏆", "💰", "💎", "🚀", "🎉",
];

function ChatPageContent() {
  const searchParams = useSearchParams();
  const receiverFromUrl = searchParams.get("user");

  const [userId, setUserId] = useState<string | null>(null);
  const [receiverId, setReceiverId] = useState(
    receiverFromUrl || ""
  );
  const [receiver, setReceiver] = useState<Profile | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<
    Record<string, Profile>
  >({});

  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(
    null
  );
  const [editingText, setEditingText] = useState("");

  const [mediaViewer, setMediaViewer] =
    useState<MediaViewer | null>(null);

  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const [showViewerControls, setShowViewerControls] =
    useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  const hideControlsTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const draggingRef = useRef(false);

  const dragStartRef = useRef({
    x: 0,
    y: 0,
    positionX: 0,
    positionY: 0,
  });

  const pinchRef = useRef({
    active: false,
    startDistance: 0,
    startZoom: 1,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  useEffect(() => {
    if (receiverFromUrl) {
      setReceiverId(receiverFromUrl);
    }
  }, [receiverFromUrl]);

  /*
   * Загружает список всех пользователей,
   * с которыми текущий пользователь когда-либо переписывался.
   *
   * Источник данных — ТОЛЬКО messages.
   */
  async function loadChatList() {
    if (!userId) return;

    setLoadingChats(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `sender_id.eq.${userId},receiver_id.eq.${userId}`
      )
      .neq("message_type", "system")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Ошибка загрузки списка чатов:",
        error
      );
      setLoadingChats(false);
      return;
    }

    const allMessages = (data || []) as Message[];

    /*
     * Для каждого собеседника оставляем
     * самое последнее сообщение.
     */
    const chatMap = new Map<string, Message>();

    for (const message of allMessages) {
      const otherUserId =
        message.sender_id === userId
          ? message.receiver_id
          : message.sender_id;

      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, message);
      }
    }

    const userIds = Array.from(chatMap.keys());

    if (userIds.length === 0) {
      setChatList([]);
      setLoadingChats(false);
      return;
    }

    /*
     * Загружаем профили всех собеседников.
     */
    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        "id, username, profile_id, avatar_url"
      )
      .in("id", userIds);

    if (profileError) {
      console.error(
        "Ошибка загрузки профилей чатов:",
        profileError
      );
    }

    const profileMap = new Map<
      string,
      Profile
    >();

    (profileData || []).forEach((profile) => {
      profileMap.set(profile.id, profile);
    });

    /*
     * Считаем непрочитанные сообщения
     * отдельно для каждого собеседника.
     */
    const unreadCounts = new Map<
      string,
      number
    >();

    allMessages.forEach((message) => {
      if (
        message.receiver_id === userId &&
        !message.is_read
      ) {
        const current =
          unreadCounts.get(message.sender_id) || 0;

        unreadCounts.set(
          message.sender_id,
          current + 1
        );
      }
    });

    const chats: ChatItem[] = userIds.map(
      (otherUserId) => ({
        userId: otherUserId,
        profile:
          profileMap.get(otherUserId) || null,
        lastMessage:
          chatMap.get(otherUserId)!,
        unreadCount:
          unreadCounts.get(otherUserId) || 0,
      })
    );

    setChatList(chats);
    setLoadingChats(false);
  }

  /*
   * Загружаем список чатов сразу после
   * получения ID текущего пользователя.
   */
  useEffect(() => {
    if (!userId) return;

    loadChatList();
  }, [userId]);

  useEffect(() => {
    if (!userId || !receiverId) return;

    loadChat();
    loadReceiver();

    const channel = supabase
      .channel(
        `chat-${userId}-${receiverId}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMessage =
            payload.new as Message;

          const belongsToChat =
            (newMessage.sender_id === userId &&
              newMessage.receiver_id ===
                receiverId) ||
            (newMessage.sender_id ===
              receiverId &&
              newMessage.receiver_id ===
                userId);

          /*
           * Даже если сообщение относится
           * к другому диалогу, обновляем левый список.
           */
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            await loadChatList();
          }

          if (!belongsToChat) return;

          if (
            payload.eventType === "INSERT"
          ) {
            setMessages((current) => {
              if (
                current.some(
                  (item) =>
                    item.id ===
                    newMessage.id
                )
              ) {
                return current;
              }

              return [
                ...current,
                newMessage,
              ];
            });

            if (
              newMessage.receiver_id ===
              userId
            ) {
              markAsRead(newMessage.id);
            }
          }

          if (
            payload.eventType === "UPDATE"
          ) {
            setMessages((current) =>
              current.map((item) =>
                item.id === newMessage.id
                  ? newMessage
                  : item
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function loadReceiver() {
    if (!receiverId) {
      setReceiver(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, profile_id, avatar_url"
      )
      .eq("id", receiverId)
      .maybeSingle();

    if (error) {
      console.error(
        "Ошибка загрузки профиля:",
        error
      );
      return;
    }

    if (data) {
      setReceiver(data);
    }
  }

  async function loadChat() {
    if (!userId || !receiverId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`
      )
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Ошибка загрузки сообщений:",
        error
      );
      return;
    }

    const loadedMessages =
      (data || []) as Message[];

    setMessages(loadedMessages);

    const ids = Array.from(
      new Set(
        loadedMessages.flatMap(
          (item) => [
            item.sender_id,
            item.receiver_id,
          ]
        )
      )
    );

    if (ids.length > 0) {
      const {
        data: profileData,
      } = await supabase
        .from("profiles")
        .select(
          "id, username, profile_id, avatar_url"
        )
        .in("id", ids);

      if (profileData) {
        const map: Record<
          string,
          Profile
        > = {};

        profileData.forEach(
          (profile) => {
            map[profile.id] =
              profile;
          }
        );

        setProfiles(map);
      }
    }

    const unread =
      loadedMessages.filter(
        (item) =>
          item.receiver_id ===
            userId &&
          !item.is_read
      );

    for (const item of unread) {
      await markAsRead(item.id);
    }

    if (unread.length > 0) {
      await loadChatList();
    }
  }

  async function addEmoji(emoji: string) {
    if (
      !userId ||
      !receiverId ||
      sending
    ) {
      return;
    }

    setSending(true);

    const {
      data,
      error,
    } = await supabase
      .from("messages")
      .insert({
        sender_id: userId,
        receiver_id: receiverId,
        message: emoji,
        message_type: "text",
      })
      .select("*")
      .single();

    if (error) {
      console.error(
        "Ошибка отправки эмодзи:",
        error
      );
    } else if (data) {
      const newMessage =
        data as Message;

      setMessages((current) => {
        if (
          current.some(
            (item) =>
              item.id === newMessage.id
          )
        ) {
          return current;
        }

        return [
          ...current,
          newMessage,
        ];
      });

      setShowEmojiPicker(false);

      await loadChatList();
    }

    setSending(false);
  }

  async function sendMessage() {
    if (
      !userId ||
      !receiverId ||
      !text.trim() ||
      sending
    ) {
      return;
    }

    setSending(true);

    const messageText =
      text.trim();

    const {
      data,
      error,
    } = await supabase
      .from("messages")
      .insert({
        sender_id: userId,
        receiver_id: receiverId,
        message: messageText,
        message_type: "text",
      })
      .select("*")
      .single();

    if (error) {
      console.error(
        "Ошибка отправки:",
        error
      );
    } else if (data) {
      setMessages((current) => {
        if (
          current.some(
            (item) =>
              item.id === data.id
          )
        ) {
          return current;
        }

        return [
          ...current,
          data,
        ];
      });

      setText("");

      await loadChatList();
    }

    setSending(false);
  }

  async function markAsRead(
    messageId: string
  ) {
    if (!userId) return;

    await supabase
      .from("messages")
      .update({
        is_read: true,
        read_at:
          new Date().toISOString(),
      })
      .eq("id", messageId)
      .eq(
        "receiver_id",
        userId
      );
  }

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (
      !file ||
      !userId ||
      !receiverId
    ) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "Можно отправлять только фото и видео."
      );
      event.target.value = "";
      return;
    }

    if (
      file.size >
      50 * 1024 * 1024
    ) {
      alert(
        "Размер файла не должен превышать 50 МБ."
      );
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "file";

      const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const filePath =
        `${userId}/${fileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("chat-media")
        .upload(
          filePath,
          file,
          {
            contentType:
              file.type,
            upsert: false,
          }
        );

      if (uploadError) {
        alert(
          `Ошибка загрузки: ${uploadError.message}`
        );
        return;
      }

      const {
        data: {
          publicUrl,
        },
      } =
        supabase.storage
          .from("chat-media")
          .getPublicUrl(
            filePath
          );

      const messageType =
        file.type.startsWith(
          "image/"
        )
          ? "image"
          : "video";

      const {
        data,
        error,
      } = await supabase
        .from("messages")
        .insert({
          sender_id: userId,
          receiver_id:
            receiverId,
          message: publicUrl,
          message_type:
            messageType,
          file_url:
            publicUrl,
          file_name:
            file.name,
          file_type:
            file.type,
        })
        .select("*")
        .single();

      if (error) {
        console.error(
          "Ошибка создания сообщения:",
          error
        );

        alert(
          `Ошибка отправки файла: ${error.message}`
        );
      } else if (data) {
        setMessages(
          (current) => {
            if (
              current.some(
                (item) =>
                  item.id ===
                  data.id
              )
            ) {
              return current;
            }

            return [
              ...current,
              data,
            ];
          }
        );

        await loadChatList();
      }
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function saveEdit(
    messageId: string
  ) {
    if (!editingText.trim())
      return;

    const { error } =
      await supabase
        .from("messages")
        .update({
          message:
            editingText.trim(),
          edited_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          messageId
        )
        .eq(
          "sender_id",
          userId
        );

    if (error) {
      console.error(
        "Ошибка редактирования:",
        error
      );
      return;
    }

    setEditingId(null);
    setEditingText("");

    await loadChat();
    await loadChatList();
  }

  function startEdit(
    message: Message
  ) {
    setEditingId(message.id);
    setEditingText(
      message.message
    );
  }

  function getProfile(
    id: string
  ) {
    return profiles[id];
  }

  function formatTime(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleTimeString(
      "ru-RU",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function formatChatTime(
    date: string
  ) {
    const messageDate =
      new Date(date);

    const now = new Date();

    const sameDay =
      messageDate.toDateString() ===
      now.toDateString();

    if (sameDay) {
      return messageDate.toLocaleTimeString(
        "ru-RU",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }

    const yesterday =
      new Date(now);

    yesterday.setDate(
      now.getDate() - 1
    );

    if (
      messageDate.toDateString() ===
      yesterday.toDateString()
    ) {
      return "вчера";
    }

    return messageDate.toLocaleDateString(
      "ru-RU",
      {
        day: "2-digit",
        month: "2-digit",
      }
    );
  }

  function isEmojiOnlyMessage(message: string) {
    const value = message.trim();

    if (!value || value.length > 40) {
      return false;
    }

    return /^[\p{Extended_Pictographic}\p{Emoji_Component}\s]+$/u.test(value);
  }

  function getEmojiMessageClass(message: string) {
    const count = Array.from(message.trim()).filter((char) =>
      /\p{Extended_Pictographic}/u.test(char)
    ).length;

    if (count <= 1) return "text-6xl leading-none";
    if (count <= 3) return "text-5xl leading-tight";
    if (count <= 6) return "text-4xl leading-tight";

    return "text-3xl leading-tight";
  }

  function getLastMessagePreview(
    message: Message
  ) {
    if (
      message.message_type ===
      "image"
    ) {
      return "📷 Фото";
    }

    if (
      message.message_type ===
      "video"
    ) {
      return "🎥 Видео";
    }

    if (
      message.message_type ===
      "system"
    ) {
      return "Системное сообщение";
    }

    return message.message;
  }

  function selectChat(
    id: string
  ) {
    setReceiverId(id);
  }

  function resetViewer() {
    setZoom(1);

    setPosition({
      x: 0,
      y: 0,
    });

    setShowViewerControls(
      true
    );

    if (
      hideControlsTimer.current
    ) {
      clearTimeout(
        hideControlsTimer.current
      );
    }
  }

  function openMedia(
    type:
      | "image"
      | "video",
    url: string
  ) {
    resetViewer();

    setMediaViewer({
      type,
      url,
    });

    startControlsTimer();
  }

  function closeMedia() {
    setMediaViewer(null);

    resetViewer();

    if (
      document.fullscreenElement
    ) {
      document
        .exitFullscreen()
        .catch(() => {});
    }
  }

  function startControlsTimer() {
    if (
      hideControlsTimer.current
    ) {
      clearTimeout(
        hideControlsTimer.current
      );
    }

    setShowViewerControls(
      true
    );

    hideControlsTimer.current =
      setTimeout(() => {
        setShowViewerControls(
          false
        );
      }, 5000);
  }

  function toggleViewerControls() {
    if (
      showViewerControls
    ) {
      if (
        hideControlsTimer.current
      ) {
        clearTimeout(
          hideControlsTimer.current
        );
      }

      setShowViewerControls(
        false
      );
    } else {
      startControlsTimer();
    }
  }

  function changeZoom(
    amount: number
  ) {
    setZoom((current) => {
      const next = Math.min(
        5,
        Math.max(
          1,
          current + amount
        )
      );

      if (next === 1) {
        setPosition({
          x: 0,
          y: 0,
        });
      }

      return next;
    });

    startControlsTimer();
  }

  function handleViewerWheel(
    event: React.WheelEvent<HTMLDivElement>
  ) {
    if (
      !mediaViewer ||
      mediaViewer.type !==
        "image"
    ) {
      return;
    }

    event.preventDefault();

    const amount =
      event.deltaY > 0
        ? -0.15
        : 0.15;

    changeZoom(amount);
  }

  function handleMouseDown(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (
      !mediaViewer ||
      mediaViewer.type !==
        "image" ||
      zoom <= 1
    ) {
      return;
    }

    draggingRef.current =
      true;

    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      positionX: position.x,
      positionY: position.y,
    };

    startControlsTimer();
  }

  function handleMouseMove(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (
      !draggingRef.current ||
      !mediaViewer ||
      mediaViewer.type !==
        "image"
    ) {
      return;
    }

    const dx =
      event.clientX -
      dragStartRef.current.x;

    const dy =
      event.clientY -
      dragStartRef.current.y;

    setPosition({
      x:
        dragStartRef.current
          .positionX + dx,
      y:
        dragStartRef.current
          .positionY + dy,
    });
  }

  function handleMouseUp() {
    draggingRef.current =
      false;
  }

  function getTouchDistance(
    touches: React.TouchList
  ): number {
    if (touches.length < 2) {
      return 0;
    }

    const first =
      touches[0];
    const second =
      touches[1];

    const dx =
      second.clientX -
      first.clientX;

    const dy =
      second.clientY -
      first.clientY;

    return Math.sqrt(
      dx * dx + dy * dy
    );
  }

  function handleTouchStart(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    if (
      !mediaViewer ||
      mediaViewer.type !==
        "image"
    ) {
      return;
    }

    startControlsTimer();

    if (
      event.touches.length === 2
    ) {
      const distance =
        getTouchDistance(
          event.touches
        );

      pinchRef.current = {
        active: true,
        startDistance:
          distance,
        startZoom: zoom,
        lastX: 0,
        lastY: 0,
      };

      return;
    }

    if (
      event.touches.length === 1 &&
      zoom > 1
    ) {
      const touch =
        event.touches[0];

      pinchRef.current = {
        active: true,
        startDistance: 0,
        startZoom: zoom,
        lastX:
          touch.clientX,
        lastY:
          touch.clientY,
      };
    }
  }

  function handleTouchMove(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    if (
      !mediaViewer ||
      mediaViewer.type !==
        "image"
    ) {
      return;
    }

    if (
      event.touches.length === 2 &&
      pinchRef.current.active
    ) {
      event.preventDefault();

      const distance =
        getTouchDistance(
          event.touches
        );

      if (
        !pinchRef.current
          .startDistance
      ) {
        return;
      }

      const scale =
        distance /
        pinchRef.current
          .startDistance;

      const newZoom =
        Math.min(
          5,
          Math.max(
            1,
            pinchRef.current
              .startZoom *
              scale
          )
        );

      setZoom(newZoom);

      if (newZoom === 1) {
        setPosition({
          x: 0,
          y: 0,
        });
      }

      startControlsTimer();

      return;
    }

    if (
      event.touches.length === 1 &&
      zoom > 1 &&
      pinchRef.current.active
    ) {
      event.preventDefault();

      const touch =
        event.touches[0];

      const dx =
        touch.clientX -
        pinchRef.current.lastX;

      const dy =
        touch.clientY -
        pinchRef.current.lastY;

      setPosition(
        (current) => ({
          x:
            current.x + dx,
          y:
            current.y + dy,
        })
      );

      pinchRef.current.lastX =
        touch.clientX;

      pinchRef.current.lastY =
        touch.clientY;

      startControlsTimer();
    }
  }

  function handleTouchEnd() {
    pinchRef.current.active =
      false;
  }

  function toggleFullscreen() {
    const element =
      viewerRef.current;

    if (!element) return;

    if (
      !document.fullscreenElement
    ) {
      element
        .requestFullscreen()
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .catch(() => {});
    }

    startControlsTimer();
  }

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        mediaViewer
      ) {
        closeMedia();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [mediaViewer]);

  useEffect(() => {
    return () => {
      if (
        hideControlsTimer.current
      ) {
        clearTimeout(
          hideControlsTimer.current
        );
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-text-secondary">
          Загрузка чата...
        </p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">
            Войдите в аккаунт
          </h1>

          <Link
            href="/auth"
            className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 font-semibold text-white"
          >
            Войти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
          <div className="border-b border-border px-5 py-4">
            <h1 className="text-xl font-bold">
              Чаты
            </h1>
          </div>

          <div className="flex min-h-[700px] flex-col md:flex-row">
            {/* =========================
                ЛЕВАЯ ПАНЕЛЬ — МОИ ЧАТЫ
            ========================== */}

            <aside className="w-full shrink-0 border-b border-border md:w-[330px] md:border-b-0 md:border-r">
              <div className="border-b border-border px-5 py-4">
                <h2 className="font-semibold">
                  Мои чаты
                </h2>
              </div>

              <div className="max-h-[650px] overflow-y-auto">
                {loadingChats ? (
                  <div className="flex min-h-[180px] items-center justify-center px-5">
                    <p className="text-sm text-text-secondary">
                      Загружаем чаты...
                    </p>
                  </div>
                ) : chatList.length === 0 ? (
                  <div className="flex min-h-[180px] items-center justify-center px-6 text-center">
                    <div>
                      <div className="mb-3 text-4xl">
                        💬
                      </div>

                      <p className="font-medium">
                        У вас пока нет начатых чатов
                      </p>

                      <p className="mt-1 text-xs text-text-secondary">
                        Откройте профиль продавца или покупателя,
                        чтобы начать общение.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {chatList.map(
                      (chat) => {
                        const active =
                          chat.userId ===
                          receiverId;

                        const username =
                          chat.profile
                            ?.username ||
                          "Пользователь";

                        return (
                          <button
                            key={
                              chat.userId
                            }
                            type="button"
                            onClick={() =>
                              selectChat(
                                chat.userId
                              )
                            }
                            className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition ${
                              active
                                ? "bg-primary/10"
                                : "hover:bg-background"
                            }`}
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent">
                              {chat.profile
                                ?.avatar_url ? (
                                <img
                                  src={
                                    chat
                                      .profile
                                      .avatar_url
                                  }
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center font-bold text-white">
                                  {username
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>
                              )}

                              {chat.unreadCount >
                                0 && (
                                <span className="absolute bottom-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-card bg-primary px-1 text-[10px] font-bold text-white">
                                  {chat.unreadCount >
                                  99
                                    ? "99+"
                                    : chat.unreadCount}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`truncate text-sm ${
                                    chat.unreadCount >
                                    0
                                      ? "font-bold"
                                      : "font-semibold"
                                  }`}
                                >
                                  {username}
                                </span>

                                <span
                                  className={`shrink-0 text-[10px] ${
                                    chat.unreadCount >
                                    0
                                      ? "font-semibold text-primary"
                                      : "text-text-secondary"
                                  }`}
                                >
                                  {formatChatTime(
                                    chat
                                      .lastMessage
                                      .created_at
                                  )}
                                </span>
                              </div>

                              <div className="mt-1 flex items-center gap-2">
                                <p
                                  className={`min-w-0 flex-1 truncate text-xs ${
                                    chat.unreadCount >
                                    0
                                      ? "font-medium text-foreground"
                                      : "text-text-secondary"
                                  }`}
                                >
                                  {chat.lastMessage
                                    .sender_id ===
                                    userId &&
                                    "Вы: "}

                                  {getLastMessagePreview(
                                    chat.lastMessage
                                  )}
                                </p>

                                {chat.unreadCount >
                                  0 && (
                                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* =========================
                ПРАВАЯ ПАНЕЛЬ — ДИАЛОГ
            ========================== */}

            <section className="flex min-w-0 flex-1 flex-col">
              {!receiverId ? (
                <div className="flex min-h-[600px] flex-1 items-center justify-center px-6">
                  <div className="max-w-md text-center">
                    <div className="mb-4 text-5xl">
                      💬
                    </div>

                    <h2 className="text-xl font-bold">
                      Выберите чат
                    </h2>

                    <p className="mt-2 text-sm text-text-secondary">
                      Выберите пользователя слева,
                      чтобы открыть переписку.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Шапка диалога */}

                  <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent">
                      {receiver?.avatar_url ? (
                        <img
                          src={
                            receiver.avatar_url
                          }
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-white">
                          {receiver?.username
                            ?.charAt(0)
                            .toUpperCase() ||
                            "U"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      {receiver ? (
                        <Link
                          href={`/profile/${
                            receiver.profile_id ||
                            receiver.id
                          }`}
                          className="block truncate font-semibold hover:text-primary"
                        >
                          {receiver.username ||
                            "Пользователь"}
                        </Link>
                      ) : (
                        <p className="font-semibold">
                          Пользователь
                        </p>
                      )}

                      {receiver?.profile_id && (
                        <p className="text-xs text-text-secondary">
                          ID: {receiver.profile_id}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Сообщения */}

                  <div className="min-h-[500px] max-h-[650px] flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-6">
                    {messages.length ===
                    0 ? (
                      <div className="flex min-h-[450px] items-center justify-center">
                        <div className="text-center">
                          <div className="mb-3 text-4xl">
                            👋
                          </div>

                          <p className="text-sm text-text-secondary">
                            Начните общение с пользователем.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map(
                          (item) => {
                            const mine =
                              item.sender_id ===
                              userId;

                            const profile =
                              getProfile(
                                item.sender_id
                              );

                            if (
                              item.message_type ===
                              "system"
                            ) {
                              return (
                                <div
                                  key={
                                    item.id
                                  }
                                  className="flex justify-center"
                                >
                                  <div className="rounded-2xl border border-border bg-card px-5 py-3 text-center text-xs text-text-secondary">
                                    {
                                      item.message
                                    }
                                  </div>
                                </div>
                              );
                            }

                            const mediaUrl =
                              item.file_url ||
                              item.message;

                            return (
                              <div
                                key={
                                  item.id
                                }
                                className={`flex ${
                                  mine
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`flex max-w-[85%] gap-2 ${
                                    mine
                                      ? "flex-row-reverse"
                                      : ""
                                  }`}
                                >
                                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent">
                                    {profile?.avatar_url ? (
                                      <img
                                        src={
                                          profile.avatar_url
                                        }
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                                        {profile?.username
                                          ?.charAt(
                                            0
                                          )
                                          .toUpperCase() ||
                                          "U"}
                                      </div>
                                    )}
                                  </div>

                                  <div
                                    className={`min-w-0 rounded-3xl border px-4 py-3 ${
                                      mine
                                        ? "border-primary/30 bg-primary/10"
                                        : "border-border bg-card"
                                    }`}
                                  >
                                    <Link
                                      href={`/profile/${
                                        profile?.profile_id ||
                                        item.sender_id
                                      }`}
                                      className="mb-1 block text-xs font-semibold text-primary hover:underline"
                                    >
                                      {profile?.username ||
                                        "Пользователь"}
                                    </Link>

                                    {editingId ===
                                    item.id ? (
                                      <div className="min-w-[220px]">
                                        <textarea
                                          value={
                                            editingText
                                          }
                                          onChange={(
                                            e
                                          ) =>
                                            setEditingText(
                                              e
                                                .target
                                                .value
                                            )
                                          }
                                          rows={
                                            3
                                          }
                                          className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                                        />

                                        <div className="mt-2 flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              saveEdit(
                                                item.id
                                              )
                                            }
                                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                                          >
                                            Сохранить
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingId(
                                                null
                                              );
                                              setEditingText(
                                                ""
                                              );
                                            }}
                                            className="rounded-lg border border-border px-3 py-1.5 text-xs"
                                          >
                                            Отмена
                                          </button>
                                        </div>
                                      </div>
                                    ) : item.message_type ===
                                      "image" ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openMedia(
                                            "image",
                                            mediaUrl
                                          )
                                        }
                                        className="block max-w-full cursor-zoom-in overflow-hidden rounded-2xl text-left"
                                      >
                                        <img
                                          src={
                                            mediaUrl
                                          }
                                          alt="Изображение"
                                          className="max-h-96 max-w-full rounded-2xl object-contain transition duration-200 hover:opacity-90"
                                        />
                                      </button>
                                    ) : 
                                      item.message_type ===
                                      "video" ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openMedia(
                                            "video",
                                            mediaUrl
                                          )
                                        }
                                        className="group relative block max-w-full overflow-hidden rounded-2xl"
                                      >
                                        <video
                                          src={
                                            mediaUrl
                                          }
                                          preload="metadata"
                                          muted
                                          playsInline
                                          className="max-h-96 max-w-full rounded-2xl object-contain"
                                        />

                                        <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/20">
                                          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-2xl text-white backdrop-blur-sm">
                                            ▶
                                          </span>
                                        </span>
                                      </button>
                                    ) : 
                                      isEmojiOnlyMessage(item.message) ? (
                                        <p
                                          className={`whitespace-pre-wrap break-words ${getEmojiMessageClass(
                                            item.message
                                          )}`}
                                        >
                                          {item.message}
                                        </p>
                                      ) : (
                                        <p className="whitespace-pre-wrap break-words text-sm">
                                          {item.message}
                                        </p>
                                      )}

                                    <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-text-secondary">
                                      {item.edited_at && (
                                        <span>
                                          изменено
                                        </span>
                                      )}

                                      <span>
                                        {formatTime(
                                          item.created_at
                                        )}
                                      </span>

                                      {mine && (
                                        <span
                                          className={
                                            item.is_read
                                              ? "text-blue-400"
                                              : "text-text-secondary"
                                          }
                                        >
                                          {item.is_read
                                            ? "✓✓"
                                            : "✓"}
                                        </span>
                                      )}
                                    </div>

                                    {mine &&
                                      item.message_type ===
                                        "text" &&
                                      editingId !==
                                        item.id && (
                                        <div className="mt-1 text-right">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              startEdit(
                                                item
                                              )
                                            }
                                            className="text-[10px] text-text-secondary transition hover:text-primary"
                                          >
                                            Изменить
                                          </button>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}

                        <div
                          ref={
                            messagesEndRef
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Поле ввода */}

                  <div className="border-t border-border bg-card p-4">
                    <div className="flex items-end gap-2 rounded-3xl border border-border bg-background p-2">
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        disabled={
                          uploading
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border text-lg transition hover:border-primary/50 disabled:opacity-50"
                        title="Фото или видео"
                      >
                        📎
                      </button>

                      <input
                        ref={
                          fileInputRef
                        }
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                        onChange={
                          handleFileUpload
                        }
                        className="hidden"
                      />

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowEmojiPicker((current) => !current)
                          }
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border text-lg transition hover:border-primary/50"
                          title="Эмодзи"
                        >
                          😊
                        </button>

                        {showEmojiPicker && (
                          <div className="absolute bottom-14 left-0 z-30 grid w-[252px] grid-cols-6 gap-1 rounded-2xl border border-border bg-card p-2 shadow-xl">
                            {EMOJI_LIST.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => addEmoji(emoji)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-xl transition hover:bg-primary/10"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <textarea
                        value={text}
                        onChange={(e) =>
                          setText(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !e.shiftKey
                          ) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        rows={1}
                        placeholder="Напишите сообщение..."
                        className="max-h-32 min-h-[44px] min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none placeholder:text-text-secondary/60"
                      />

                      <button
                        type="button"
                        onClick={
                          sendMessage
                        }
                        disabled={
                          !text.trim() ||
                          sending
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Отправить"
                      >
                        ➤
                      </button>
                    </div>

                    {uploading && (
                      <p className="mt-2 px-2 text-xs text-text-secondary">
                        Загружаем файл...
                      </p>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* =========================
          ПРОСМОТР МЕДИА
      ========================== */}

      {mediaViewer && (
        <div
          ref={viewerRef}
          className="fixed inset-0 z-[100] bg-black/95"
          onWheel={
            handleViewerWheel
          }
          onMouseDown={
            handleMouseDown
          }
          onMouseMove={
            handleMouseMove
          }
          onMouseUp={
            handleMouseUp
          }
          onMouseLeave={
            handleMouseUp
          }
          onTouchStart={
            handleTouchStart
          }
          onTouchMove={
            handleTouchMove
          }
          onTouchEnd={
            handleTouchEnd
          }
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <button
              type="button"
              aria-label="Закрыть просмотр"
              onClick={
                toggleViewerControls
              }
              className="absolute inset-0 h-full w-full cursor-default"
            />

            <div
              className={`relative z-10 flex items-center justify-center ${
                mediaViewer.type ===
                  "image" &&
                zoom > 1
                  ? "cursor-grab"
                  : ""
              }`}
              style={{
                transform:
                  mediaViewer.type ===
                  "image"
                    ? `translate(${position.x}px, ${position.y}px) scale(${zoom})`
                    : "none",
                transition:
                  draggingRef.current
                    ? "none"
                    : "transform 0.15s ease-out",
              }}
            >
              {mediaViewer.type ===
              "image" ? (
                <img
                  src={
                    mediaViewer.url
                  }
                  alt="Просмотр изображения"
                  draggable={false}
                  className="block max-h-[calc(100vh-120px)] max-w-[calc(100vw-40px)] select-none object-contain sm:max-h-[calc(100vh-140px)] sm:max-w-[calc(100vw-80px)]"
                />
              ) : (
                <video
                  src={
                    mediaViewer.url
                  }
                  controls
                  autoPlay
                  playsInline
                  className="block max-h-[calc(100vh-120px)] max-w-[calc(100vw-40px)] rounded-xl object-contain sm:max-h-[calc(100vh-140px)] sm:max-w-[calc(100vw-80px)]"
                />
              )}
            </div>
          </div>

          <div
            className={`pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 ${
              showViewerControls
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            <div className="pointer-events-auto absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:right-6 sm:top-6">
              <div className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm text-white/80 backdrop-blur-md">
                {mediaViewer.type ===
                "image"
                  ? "Изображение"
                  : "Видео"}
              </div>

              <button
                type="button"
                onClick={
                  closeMedia
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/50 text-xl text-white/80 backdrop-blur-md transition hover:bg-black/70 hover:text-white"
                title="Закрыть"
              >
                ×
              </button>
            </div>

            {mediaViewer.type ===
              "image" && (
              <div className="pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-black/55 p-2 backdrop-blur-md sm:bottom-7">
                <button
                  type="button"
                  onClick={() =>
                    changeZoom(
                      -0.5
                    )
                  }
                  disabled={
                    zoom <= 1
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl text-white/90 transition hover:bg-white/25 disabled:opacity-30"
                  title="Уменьшить"
                >
                  −
                </button>

                <div className="min-w-[58px] text-center text-xs font-medium text-white/75">
                  {Math.round(
                    zoom * 100
                  )}
                  %
                </div>

                <button
                  type="button"
                  onClick={() =>
                    changeZoom(
                      0.5
                    )
                  }
                  disabled={
                    zoom >= 5
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl text-white/90 transition hover:bg-white/25 disabled:opacity-30"
                  title="Увеличить"
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPosition({
                      x: 0,
                      y: 0,
                    });
                    startControlsTimer();
                  }}
                  className="ml-1 rounded-xl bg-white/10 px-3 py-2 text-xs text-white/80 transition hover:bg-white/20"
                >
                  Сбросить
                </button>

                <button
                  type="button"
                  onClick={
                    toggleFullscreen
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg text-white/80 transition hover:bg-white/20"
                  title="Полный экран"
                >
                  ⛶
                </button>
              </div>
            )}

            {mediaViewer.type ===
              "video" && (
              <button
                type="button"
                onClick={
                  toggleFullscreen
                }
                className="pointer-events-auto absolute bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/45 text-lg text-white/80 backdrop-blur-md transition hover:bg-black/65"
                title="Полный экран"
              >
                ⛶
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-text-secondary">
            Загрузка чата...
          </p>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
