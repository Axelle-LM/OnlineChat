import { useEffect, useRef } from "react";
import s from "./Message.module.scss";
import { gsap } from "gsap";

const Message = ({ username, content, fromSelf }) => {

    const messageRef = useRef();

    useEffect(() => {
        gsap.to(messageRef.current, {
            opacity: 1,
            x: 0,
        })
    }, []);

    return (
        <div ref={messageRef} className={`${s.message} ${fromSelf ? s.message__self : ""}`}>

            {username}:{content}
        </div>
    );
};

export default Message;