import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getChatMessages, getMyConversations, uploadChatFile } from '../../src/api/chatEndPoints';
import { getBookingDetails as getResidentBooking } from '../../src/api/residentEndPoints';
import { getJobDetails as getProviderBooking } from '../../src/api/serviceProviderEndPoints';
import { useAuth } from '../../src/context/AuthContext';
import { useSocket } from '../../src/context/SocketContext';
import { Colors } from '../../src/theme/colors';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../../src/api/apiInstance';

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // booking ID or User ID (for initial chat, depends on API)
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [activeConv, setActiveConv] = useState(null);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const myId = user?._id || user?.user_id;
  const normalizeUrl = (url) => {
    if (!url) return null;
    if (String(url).startsWith('http')) return url;
    const base = BASE_URL?.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    fetchMessages();
    fetchConversations();

    if (socket) {
      socket.emit('join_chat', { bookingId: id });

      socket.on('receive_message', (message) => {
        if (message.booking === id || message.bookingId === id) {
          setMessages((prev) => [...prev, message]);
          const senderId = message.senderId || message.sender?._id || message.sender;
          if (String(senderId) !== String(myId)) {
            socket.emit('mark_read', { bookingId: id });
          }
          setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        }
      });

      socket.on('user_typing', ({ bookingId, userId, isTyping: typing }) => {
        if (bookingId === id && userId !== (user._id || user.user_id)) {
          setIsTyping(Boolean(typing));
        }
      });

      socket.on('typing', ({ bookingId, userId }) => {
        if (bookingId === id && userId !== (user._id || user.user_id)) {
          setIsTyping(true);
        }
      });

      socket.on('stop_typing', ({ bookingId, userId }) => {
        if (bookingId === id && userId !== (user._id || user.user_id)) {
          setIsTyping(false);
        }
      });

      socket.on('messages_read', () => {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      });

      socket.on('user_status_changed', ({ userId, status }) => {
        const otherId = activeConv?.otherPerson?._id || otherUser?._id;
        if (otherId && String(userId) === String(otherId)) {
          setIsOtherOnline(status === 'online');
        }
      });

      const otherId = activeConv?.otherPerson?._id || otherUser?._id;
      if (otherId) {
        socket.emit('check_online_status', { userId: String(otherId) }, (res) => {
          setIsOtherOnline(Boolean(res?.isOnline));
        });
      }
    }

    return () => {
      if (socket) {
        socket.emit('leave_chat', { bookingId: id });
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('typing');
        socket.off('stop_typing');
        socket.off('messages_read');
        socket.off('user_status_changed');
      }
    };
  }, [id, socket, activeConv?.otherPerson?._id, otherUser?._id, myId]);

  const fetchConversations = async () => {
    try {
      const res = await getMyConversations();
      const list = res.data.data || [];
      const match = list.find((c) => c.bookingId === id || c._id === id);
      setActiveConv(match || null);
    } catch (err) {
      console.error('Conversation fetch error:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await getChatMessages(id);
      const msgs = res.data.data?.messages || res.data.data || [];
      setMessages(msgs);
      
      // Fetch booking details to get the other person's name accurately
      if (user?.role === 'resident') {
        const bookRes = await getResidentBooking(id).catch(() => ({ data: { data: {} } }));
        const booking = bookRes.data.data?.booking || bookRes.data.data;
        const providerObj = booking?.selectedProvider;
        const providerName = providerObj?.name || providerObj?.userId?.name;
        const providerId = providerObj?.userId?._id || providerObj?._id;
        setOtherUser({ name: providerName || 'Worker', _id: providerId });
        setBookingStatus(booking?.status);
      } else {
        const jobRes = await getProviderBooking(id).catch(() => ({ data: { data: {} } }));
        const job = jobRes.data.data;
        const residentName = job?.resident?.name || job?.resident?.full_name;
        const residentId = job?.resident?._id || job?.resident?.id;
        setOtherUser({ name: residentName || 'Customer', _id: residentId });
        setBookingStatus(job?.status);
      }
    } catch (err) {
      console.error('Chat fetch error:', err);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedMedia) || !socket || sending) return;
    try {
      setSending(true);
      let messageType = 'text';
      let fileUrl = null;
      let fallbackMessage = '';

      if (selectedMedia) {
        const formData = new FormData();
        formData.append('file', {
          uri: selectedMedia.uri,
          name: selectedMedia.name,
          type: selectedMedia.type,
        });
        const uploadRes = await uploadChatFile(formData);
        fileUrl = uploadRes?.data?.data?.fileUrl || uploadRes?.data?.fileUrl;
        messageType = selectedMedia.messageType;
        fallbackMessage = messageType === 'video' ? 'Sent a video' : 'Sent an image';
      }

      const outgoingText = newMessage.trim() || fallbackMessage;
      socket.emit('send_message', {
        bookingId: id,
        message: outgoingText,
        messageType,
        fileUrl,
      });
      setNewMessage('');
      setSelectedMedia(null);
      socket.emit('typing', { bookingId: id, isTyping: false });
      socket.emit('stop_typing', { bookingId: id });
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch (err) {
      console.error('send failed', err);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (text) => {
    setNewMessage(text);
    if (!socket) return;

    socket.emit('typing', { bookingId: id, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { bookingId: id, isTyping: false });
      socket.emit('stop_typing', { bookingId: id });
    }, 2000);
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const type = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
    const isVideo = String(type).startsWith('video');
    const extension = isVideo ? 'mp4' : 'jpg';
    setSelectedMedia({
      uri: asset.uri,
      type,
      name: asset.fileName || `chat-${Date.now()}.${extension}`,
      messageType: isVideo ? 'video' : 'image',
    });
  };

  const renderMessage = ({ item }) => {
    const senderId = item.senderId || item.sender?._id || item.sender;
    const isMe = String(senderId) === String(myId);
    const isMediaMessage = item.messageType === 'image' || item.messageType === 'video';
    const isFallbackMediaCaption =
      item.message === 'Sent a video' || item.message === 'Sent an image';
    const shouldShowText = Boolean(item.message) && !(isMediaMessage && isFallbackMediaCaption);

    return (
      <View style={[styles.msgContainer, isMe ? styles.myMsgContainer : styles.otherMsgContainer]}>
        <View style={[styles.msgBubble, isMe ? styles.myMsgBubble : styles.otherMsgBubble]}>
          {item.messageType === 'image' && item.fileUrl ? (
            <Image
              source={{ uri: normalizeUrl(item.fileUrl) }}
              style={styles.mediaPreview}
              resizeMode="cover"
            />
          ) : null}
          {item.messageType === 'video' && item.fileUrl ? (
            <TouchableOpacity
              style={styles.videoBtn}
              onPress={() => Linking.openURL(normalizeUrl(item.fileUrl))}
            >
              <Ionicons name="play-circle" size={20} color={isMe ? '#FFF' : Colors.primary} />
              <Text style={[styles.videoBtnText, isMe ? { color: '#FFF' } : { color: Colors.primary }]}>
                Open video
              </Text>
            </TouchableOpacity>
          ) : null}
          {shouldShowText ? (
            <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.otherMsgText]}>
              {item.message}
            </Text>
          ) : null}
          <View style={styles.timeRow}>
            <Text style={[styles.msgTime, isMe ? styles.myMsgTime : styles.otherMsgTime]}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMe ? (
              <Ionicons
                name={item.isRead ? 'checkmark-done' : 'checkmark'}
                size={13}
                color={item.isRead ? '#60A5FA' : 'rgba(255,255,255,0.75)'}
              />
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {activeConv?.otherPerson?.name || otherUser?.name || otherUser?.full_name || 'User'}
          </Text>
          <Text style={styles.typingText}>
            {isTyping ? 'typing...' : isOtherOnline ? 'online' : 'offline'}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Messages */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input */}
      {['completed', 'cancelled'].includes(bookingStatus) ? (
        <View style={{ padding: 16, backgroundColor: '#F3F4F6', alignItems: 'center', borderTopWidth: 1, borderColor: '#E5E7EB' }}>
          <Text style={{ color: '#6B7280', fontWeight: '500' }}>This job is {bookingStatus}. The chat is closed.</Text>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          {selectedMedia ? (
            <View style={styles.selectedMediaTag}>
              <Ionicons name={selectedMedia.messageType === 'video' ? 'videocam' : 'image'} size={14} color={Colors.primary} />
              <Text style={styles.selectedMediaText}>{selectedMedia.messageType === 'video' ? 'Video selected' : 'Image selected'}</Text>
              <TouchableOpacity onPress={() => setSelectedMedia(null)}>
                <Ionicons name="close-circle" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
          ) : null}
          <TouchableOpacity style={styles.attachBtn} onPress={pickMedia}>
            <Ionicons name="image" size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textLight}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !newMessage.trim() && !selectedMedia && { opacity: 0.5 }]} 
            onPress={handleSend}
            disabled={!newMessage.trim() && !selectedMedia}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  headerInfo: { alignItems: 'center' },
  headerName: { fontSize: 18, fontWeight: '700', color: Colors.text },
  typingText: { fontSize: 12, color: Colors.primary, fontStyle: 'italic', marginTop: 2 },
  msgContainer: { marginBottom: 16, flexDirection: 'row' },
  myMsgContainer: { justifyContent: 'flex-end', paddingLeft: 50 },
  otherMsgContainer: { justifyContent: 'flex-start', paddingRight: 50 },
  msgBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  myMsgBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  otherMsgBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.borderLight },
  msgText: { fontSize: 15, lineHeight: 20 },
  myMsgText: { color: '#FFF' },
  otherMsgText: { color: Colors.text },
  mediaPreview: { width: 180, height: 150, borderRadius: 12, marginBottom: 8 },
  videoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  videoBtnText: { fontSize: 13, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 2 },
  msgTime: { fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },
  myMsgTime: { color: 'rgba(255,255,255,0.7)' },
  otherMsgTime: { color: Colors.textLight },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: Colors.borderLight },
  attachBtn: { padding: 10 },
  selectedMediaTag: {
    position: 'absolute',
    top: -34,
    left: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedMediaText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, maxHeight: 100, minHeight: 44, color: Colors.text },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});
