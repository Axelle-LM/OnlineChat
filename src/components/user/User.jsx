import s from "./User.module.scss";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const User = ({ index, user, selectedUser, setSelectedUser, resetNotification }) => {


    return (
        <div key={user.userID}
            className={`${s.user} ${selectedUser?.userID === user.userID ? s.user__active : ""}`}
            onClick={() => { setSelectedUser(user), resetNotification(user) }}> {user.username}

            {
                user.hasNewMessages === true ? (
                    <span className={s.notification}></span>
                ) : null
            }
        </div>)

}

export default User;