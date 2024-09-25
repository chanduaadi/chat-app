import React, { useState, useEffect, useRef } from 'react';
import '../App.css';
import { useLocation } from 'react-router-dom';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setcurrentUser] = useState({})
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  // const userId = localStorage.getItem('userId');
  // const [loginedUserId, setLoginedUserId] = useState(userId);
  const selectedUserRef = useRef(selectedUser);
  const chatEndRef = useRef(null); // Ref for the bottom of the chat

  const query = new URLSearchParams(useLocation().search);
  const loginedUserId = query.get('userId');
  console.log("loginedUserId",loginedUserId);
   

  // Update ref whenever selectedUser changes
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Scroll to the bottom of the chat when messages change or new chat is opened
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('http://localhost:8080/users');
      const data = await res.json();
      const filteredList = data.filter((eachUser) => {
        if(eachUser._id === loginedUserId){
          setcurrentUser(eachUser)
          return false
        }
        return true
      })
      setUsers(filteredList);
    };

    fetchUsers();
  }, []);

  // Establish WebSocket connection when component mounts
  useEffect(() => {
    // Only initialize WebSocket connection when currentUser is populated
    if (currentUser && currentUser.userId) {
      const websocket = new WebSocket('ws://localhost:8080'); // Replace with your WebSocket server URL
  
      websocket.onopen = () => {
        console.log('WebSocket connection established');
        websocket.send(JSON.stringify({ type: 'connect', userId: currentUser.userId }));
      };
  
      websocket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.type === 'message' && data.senderId === selectedUserRef.current?.userId) {
          setMessages((prevMessages) => [...prevMessages, data]);
        }
      };
  
      websocket.onclose = () => {
        console.log('WebSocket connection closed');
      };
  
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
  
      setWs(websocket);
  
      // Cleanup WebSocket connection on unmount
      return () => {
        console.log('Cleaning up WebSocket connection');
        websocket.close();
      };
    }
  }, [currentUser]); // This effect depends on currentUser
  
  
  const handleSelectedUser = async (user) => {
    const fetchSelectedUserMsgs = await fetch(`http://localhost:8080/get-user-messages?senderId=${currentUser.userId}&receiverId=${user?.userId}`);
    const fetchedData = await fetchSelectedUserMsgs.json();
    setSelectedUser(user);
    setMessages(fetchedData || []);
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && ws && selectedUser) {
      const payload = {
        type: 'message',
        senderId: currentUser.userId,
        receiverId: selectedUser.userId,
        text: newMessage,
      };

      ws.send(JSON.stringify(payload));
      setMessages([...messages, { ...payload }]);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-app">
      <div className="users-list">
        <h2>Users</h2>
        <ul>
          {users.map((user) => (
            <li
              key={user._id}
              className={selectedUser && selectedUser.userId === user.userId ? 'selected-user' : ''}
              onClick={() => handleSelectedUser(user)}
            >
              {user.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-window">
        {selectedUser ? (
          <>
            <h2>Chat with {selectedUser.name}</h2>
            <div className="chat-history">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.senderId === currentUser.userId ? 'sent' : 'received'}`}>
                  {message.senderId === currentUser.userId ? 'You' : selectedUser.name}: {message.text}
                </div>
              ))}
              {/* Ref to the last message to scroll into view */}
              <div ref={chatEndRef}></div>
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="send-button" onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-user-selected">
            <h2>Select a user to start chatting</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
