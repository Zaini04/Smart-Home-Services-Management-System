import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getChatMessages, uploadChatFile } from '../../src/api/chatEndPoints';
import { getBookingDetails as getResidentBooking } from '../../src/api/residentEndPoints';
import { getJobDetails as getProviderBooking } from '../../src/api/serviceProviderEndPoints';
import { useAuth } from '../../src/context/AuthContext';
import { useSocket } from '../../src/context/SocketContext';
import { Colors } from '../../src/theme/colors';

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // booking ID or User ID (for initial chat, depends on API)
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    if (socket) {
      socket.on('receive_message', (message) => {
        if (message.booking === id) { // assuming id is booking ID
          setMessages((prev) => [...prev, message]);
          setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        }
      });

      socket.on('typing', ({ bookingId, userId }) => {
        if (bookingId === id && userId !== user._id) {
          setIsTyping(true);
        }
      });

      socket.on('stop_typing', ({ bookingId, userId }) => {
        if (bookingId === id && userId !== user._id) {
          setIsTyping(false);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('typing');
        socket.off('stop_typing');
      }
    };
  }, [id, socket]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await getChatMessages(id);
      const msgs = res.data.data?.messages || res.data.data || [];
      setMessages(msgs);
      
      // Fetch booking details to get the other person's name accurately
      if (user?.role === 'resident') {
        const bookRes = await getResidentBooking(id).catch(() => ({ data: { data: {} } }));
        const providerName = bookRes.data.data?.booking?.selectedProvider?.name || bookRes.data.data?.selectedProvider?.name;
        setOtherUser({ name: providerName || 'Worker' });
      } else {
        const jobRes = await getProviderBooking(id).catch(() => ({ data: { data: {} } }));
        const residentName = jobRes.data.data?.resident?.name;
        setOtherUser({ name: residentName || 'Customer' });
      }
    } catch (err) {
      console.error('Chat fetch error:', err);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    }
  };

  const handleSend = () => {
    if (!newMessage.trim() || !socket) return;
    
    // In a real app, you might need to fetch the receiver ID from the booking details
    // if there are no previous messages. For now, assuming the otherUser is set 
    // or backend handles it via booking ID context. We will just send bookingId and text.
    
    socket.emit('send_message', {
      bookingId: id,
      message: newMessage.trim(),
    });

    // Optimistically add message
    const tempMsg = {
      _id: Date.now().toString(),
      senderId: user._id,
      sender: user,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
      booking: id
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    socket.emit('stop_typing', { bookingId: id });
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  const handleTyping = (text) => {
    setNewMessage(text);
    if (!socket) return;

    socket.emit('typing', { bookingId: id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { bookingId: id });
    }, 2000);
  };

  const renderMessage = ({ item }) => {
    const isMe = (item.senderId || item.sender?._id || item.sender) === user._id;

    return (
      <View style={[styles.msgContainer, isMe ? styles.myMsgContainer : styles.otherMsgContainer]}>
        <View style={[styles.msgBubble, isMe ? styles.myMsgBubble : styles.otherMsgBubble]}>
          <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.otherMsgText]}>
            {item.message}
          </Text>
          <Text style={[styles.msgTime, isMe ? styles.myMsgTime : styles.otherMsgTime]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUser?.name || otherUser?.full_name || 'Chat'}</Text>
          {isTyping && <Text style={styles.typingText}>typing...</Text>}
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
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachBtn}>
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
          style={[styles.sendBtn, !newMessage.trim() && { opacity: 0.5 }]} 
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
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
  msgTime: { fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },
  myMsgTime: { color: 'rgba(255,255,255,0.7)' },
  otherMsgTime: { color: Colors.textLight },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: Colors.borderLight },
  attachBtn: { padding: 10 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, maxHeight: 100, minHeight: 44, color: Colors.text },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});
