"use client";
import { useEffect, useState, useRef } from "react";
import { socket } from "@/utils/socket";
import { useRouter } from "next/router";

import UserList from "@/components/userList/UserList"
import Input from "@/components/input/Input";
import Commands from "@/components/commands/Commands";
import s from "@/styles/index.module.scss";
import Notification from "@/components/notification/Notification";
import Message from "@/components/message/Message"

import { Amatic_SC } from "next/font/google";
import { Patrick_Hand } from "next/font/google";

const amatic = Amatic_SC({
  weight: '700',
  subsets: ['latin']
});

const patrick = Patrick_Hand({
  weight: '400',
  subsets: ['latin']
});

const Home = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const viewerRef = useRef();
  const [error, setError] = useState();
  const { push } = useRouter();
  const [selectedUser, setSelectedUser] = useState();

  const onSession = ({ sessionID, userID }) => {
    // attach the session ID to the next reconnection attempts
    socket.auth = { sessionID };
    // store it in the localStorage
    localStorage.setItem("sessionID", sessionID);
    // save the ID of the user
    socket.userID = userID;

    localStorage.clear("error");
  };


  const onMessage = (message) => {
    console.log("message received", message);
    // ❌ la variable message n'est pas un tableau
    // setMessages(message);

    // ❌ mutation qui ne trigger pas un re-render de votre app
    // messages.push(message);

    // explication sur les mutations vs la création de nouvelles variables
    // const temporaryMessages = [...messages];
    // temporaryMessages.push(message);
    // setMessages(temporaryMessages);

    // syntaxe plus courte pour la création d'une nouvelle variable
    setMessages((oldMessages) => [...oldMessages, message]);
    scrollToBottom();
  };


  const getMessagesAtInit = (messagesAtInit) => {
    // get messages when you connect to the server
    setMessages(messagesAtInit);
    scrollToBottom();
  };


  //clear le cache automatiquement s'il y a un pb de connection avec le serveur
  const onConnectionError = (err) => {
    console.log("err", err);
    localStorage.clear("username");
    localStorage.clear("sessionID");
    localStorage.setItem("error", 200);
    push("/login");
  };


  const onError = ({ code, error }) => {
    console.log(code, error);

    let title = "";
    let content = "";

    switch (code) {
      // code 100, vous savez que ça correspond à du spam, donc vous pouvez changer les valeurs
      case 100:
        title = `Erreur ${code} : Spam`;
        content = "Tu spam trop chacal";
        break;

      // case 200:
      //   break;

      default:
        break;
    }

    setError({
      title,
      content,
    });
  };

  const scrollToBottom = () => {
    console.log("scroll to bottom", viewerRef.current.scrollTop);
    viewerRef.current.scrollTop = viewerRef.current.scrollHeight;
  };



  const onUserConnect = (_user) => {
    const existingUser = users.find((user) => user.userID === _user.userID);

    if (existingUser) {
      return;
    }

    setUsers((currentUsers) => [...currentUsers, _user]);
  };

  const onUserDisconnect = (_userID) => {
    const filteredArray = [...users].filter((_user) =>
      _user.userID !== _userID ? true : false
    );
    console.log(filteredArray);
    setUsers(filteredArray);
  };


  useEffect(() => {
    socket.on("user connected", onUserConnect);
    socket.on("user disconnected", onUserDisconnect);
    socket.on("private message", onPrivateMessage);

    return () => {

      socket.off("user connected", onUserConnect);
      socket.off("user disconnected", onUserDisconnect);
      socket.off("private message", onPrivateMessage);
    };

  }, [users]);


  const onPrivateMessage = ({ content, from, to, username }) => {
    console.log(content, from, to, username);
    // check from which user the message came from
    const userMessagingIndex = users.findIndex(
      (_user) => _user.userID === from
    );

    console.log(userMessagingIndex);

    const userMessaging = users.find((_user) => _user.userID === from);

    console.log(userMessaging);

    if (!userMessaging) return;

    userMessaging.messages.push({
      content,
      from,
      to,
      username: username,
    });

    if (userMessaging.userID !== selectedUser?.userID) {
      userMessaging.hasNewMessages = true;
    }

    //  if (userMessaging.userID !== selectedUser?.userID) {
    //    userMessaging.hasNewMessages = true;
    //  }

    const _users = [...users];
    _users[userMessagingIndex] = userMessaging;

    setUsers(_users);
  };


  const getUserAtInit = (_users) => {
    console.log("you get user init", _users);
    setUsers(_users);
  }



  useEffect(() => {
    const sessionID = localStorage.getItem("sessionID");

    // session is already defined
    if (sessionID) {
      socket.auth = { sessionID };
      socket.connect();
      // first time connecting and has already visited login page
    } else if (localStorage.getItem("username")) {
      const username = localStorage.getItem("username");
      socket.auth = { username };
      socket.connect();
      //   // redirect to login page
    } else {
      push("/login");
    }


    socket.on("session", onSession);
    socket.on("message", onMessage);
    socket.on("messages", getMessagesAtInit);
    socket.on("connect_error", onConnectionError);
    socket.on("error", onError);
    socket.on("users", getUserAtInit);
    socket.on("disconnect", onConnectionError);


    return () => {
      socket.disconnect();
      socket.off("session", onSession);
      socket.off("message", onMessage);
      socket.off("messages", getMessagesAtInit);
      socket.off("connect_error", onConnectionError);
      socket.off("error", onError);
      socket.off("users", getUserAtInit);
      socket.off("disconnect", onConnectionError);
      socket.disconnect();
    };
  }, []);


  useEffect(() => {
    console.log("messages new value", messages);
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log(selectedUser);
  }, [selectedUser]);


  useEffect(() => {
    if (localStorage.getItem("error") == 200) {
      console.log("error is present");
      setError("Server is down");
    }
  }, []);


  return (
    <div>
      <h1 className={`${s.title} ${amatic.className}`}>Hello</h1>

      <UserList users={users} setUsers={setUsers} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />

      {error && <Notification
        title={error.title}
        content={error.content}
        onClose={() => setError(null)}
      />}



      {/* rend la liste des messages */}
      <div ref={viewerRef} className={`${s.messages} ${patrick.className}`}>
        {selectedUser
          ? selectedUser.messages.map((message, key) => {
            return (

              <Message
                key={key}
                username={message.username}
                content={message.content}
                fromSelf={message.from === socket.userID} />

            );
          })
          : messages.map((message, key) => {
            return (
              <Message
                key={key}
                username={message.username}
                content={message.content}
                fromSelf={message.from === socket.userID} />
            );
          })}
      </div>

      <Input selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      <Commands />


    </div >
  );
};

export default Home;
