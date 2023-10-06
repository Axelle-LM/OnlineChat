import { useEffect, useRef } from "react";
import s from "./UsersList.module.scss";
import { Amatic_SC } from "next/font/google";
import { Patrick_Hand } from "next/font/google";
import { gsap } from "gsap";
import User from "@/components/user/User"



const amatic = Amatic_SC({
    weight: '700',
    subsets: ['latin']
});

const patrick = Patrick_Hand({
    weight: '400',
    subsets: ['latin']
});



const UserList = ({ users, selectedUser, setSelectedUser, setUsers }) => {

    /*const resetNotification = (user) => {
        user.hasNewMessages = false;
    }*/

    const listRef = useRef();

    useEffect(() => {


        gsap.to(listRef.current.children, {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.1,
        });
    }, [users]);

    const resetNotification = (user) => {
        const _users = [...users];

        const index = _users.findIndex((_user) => _user.userID === user.userID);

        _users[index].hasNewMessages = false;

        setUsers(_users);
    };



    return (
        <div ref={listRef} className={`${s.userlist} ${patrick.className}`}>

            <div className={`${s.user} ${selectedUser ? "" : s.user__active}`}
                onClick={() => setSelectedUser(null)}>
                Général
            </div>



            <p>Utilisateur connecté</p>
            {users.map((user, index) => {
                return user.connected === true ? (
                    <User index={index} key={user.userID} user={user} selectedUser={selectedUser} setSelectedUser={setSelectedUser} resetNotification={resetNotification} />
                ) : null;
            })}
        </div >
    );
};

export default UserList;