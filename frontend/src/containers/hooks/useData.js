import { useLazyQuery, useMutation, useQuery, useSubscription } from '@apollo/client';
import { useGamePage } from './useGamePage'
import { CREATE_ROOM_MUTATION, JOIN_ROOM_MUTATION, ROOM_ACT_MUTATION, ROOM_ACT_SUBSCRIPTION,
     PLAYER_DATA_MUTATION, PLAYER_DATA_SUBSCRIPTION, GAME_INIT_QUERY, REMATCH_MUTATION } from '../../graphql';
import { useState, useEffect } from 'react';
import { message } from 'antd';

const useData = () => {
    //states
    const [id, setId] = useState('');//player id
    const [roomId, setRoomId] = useState('');
    const [enemyId, setEnemyId] = useState('');
    const [gameState, setGameState] = useState('None');
    const [roomMembers, setRoomMembers] = useState([]);
    //comunicate with Unity
    const enemyName = "Enemy";
    const { sendMessage } = useGamePage();
    //Mutations    
    const [createRoom, { data: createRoomData }] = useMutation(CREATE_ROOM_MUTATION);
    const [joinRoom, { data: joinRoomData }] = useMutation(JOIN_ROOM_MUTATION);
    const [rejoinRoom, {data: rejoinRoomData}] = useMutation(REMATCH_MUTATION);
    const [roomAct] = useMutation(ROOM_ACT_MUTATION);
    const [setPlayerData] = useMutation(PLAYER_DATA_MUTATION);
    //Subscriptions
    const {data: roomUpdateData} = useSubscription(ROOM_ACT_SUBSCRIPTION, {variables: {roomId:roomId}});
    const {data: enemyData} = useSubscription(PLAYER_DATA_SUBSCRIPTION, {variables: {playerId:enemyId}});
    //Query
    const queryInitData = (gameInitData) => {
        if(gameInitData&&gameState==="Init_Game")
        {
            const data = gameInitData.roomData;
            setEnemyId(data.player1.id===id ? data.player2.id : data.player1.id);
            let result = (data.player1.id===id?'0':'1');
            result += ('/' + data.player1.character.toString()+'/'+data.player2.character.toString());
            setRoomMembers(result);
            sendMessage("GameManager", "init", result);
            setGameState("First_Game");
        }
    }
    const [initData] = useLazyQuery(GAME_INIT_QUERY, {
            fetchPolicy: 'network-only',
            nextFetchPolicy: 'no-cache',
            onCompleted: queryInitData,
        },
    );
    //onCreate
    useEffect(() => {
        if(createRoomData)
        {
            const data = createRoomData.createRoom;
            setId(data.selfId);
            setRoomId(data.room.id);
            sendMessage("UI", "enterRoom", room_toStr(data.room, data.selfId));
            setGameState("Waiting");
        }
    },[createRoomData])
    //onJoin
    useEffect(() => {
        if(joinRoomData)
        {
            const data = joinRoomData.joinRoom;
            if(data.selfId)
            {
                setId(data.selfId);
                setRoomId(data.room.id);
                sendMessage("UI", "joinEnter", room_toStr(data.room, data.selfId));
                setGameState("Waiting");
            }
            else
            {
                displayStatus(data.error);
            }
        }
    },[joinRoomData])
    //on rejoin
    useEffect(() => {
        if(rejoinRoomData)
        {
            const data = rejoinRoomData.rejoinRoom;
            if(data.selfId)
            {
                setId(data.selfId);
                setRoomId(data.room.id);
                sendMessage("UI", "reEnter", room_toStr(data.room, data.selfId));
                setGameState("Waiting");
            }
            else
            {
                displayStatus(data.error);
            }
        }
    },[rejoinRoomData])
    //subscription to menu
    useEffect(() => {
        if(!roomUpdateData||gameState!=="Waiting")
            return;
        
        const data = roomUpdateData.roomActSub;
        
        if(data.error)//delete player
        {
            sendMessage("Room Menu", "removePlayer", data.id);
            return;
        }
        
        sendMessage("Room Menu", "updatePlayer", player_toStr(data, id));
        
    },[roomUpdateData])
    //subscription to enemy
    useEffect(() => {
        if(enemyData&&(gameState==="Game"||gameState==="First_Game"))
        {
            const enemy = enemyData.dataSub;
            if(enemy.id!==id)//not self
            {
                sendMessage(enemyName, "setData", enemy.data);
            }
        }
    },[enemyData])

    // reload scene
    const rematch = () => {
        if(roomMembers)
        {
            sendMessage("GameManager", "init", roomMembers);
            //leaveRoom
            if(gameState==="First_Game")
            {
                roomAct({variables:{roomId: roomId, playerId: id, act: "Leave"}});
                setGameState("Game");
            }
        }
        else
        {
            console.log("error: bug! no init data");
        }
    }
    //resetStates
    const leaveRoom = () => {
        setRoomId('');
        setEnemyId('');
        setRoomMembers([]);
        setGameState("None");
    }
    // Utility functions
    //convert data to string
    const room_toStr = (room, selfId) => {
        let result = room.id;
        const str1 = player_toStr(room.player1, selfId);
        const str2 = player_toStr(room.player2, selfId);
        if(str1)
            result += ('/' + str1 );
        if(str2)
            result += ('/' + str2 );
        return result;
    }
    const player_toStr = (player, selfId) => {
        if(player.id === null)
            return null;
        return (player.id+'/'+player.name+
            '/'+player.character.toString()+'/'+player.isReady.toString()+
            '/'+(player.id===selfId?'1':'0')
        );
    }
    //display status
    const displayStatus = (msg) => {
        if (msg) {
          const content = { content: msg, duration: 0.5 }
          message.error(content);
        }
    }

    return { id, roomId, createRoom, joinRoom, roomAct, setPlayerData, initData, rematch, leaveRoom,
        rejoinRoom, gameState, setGameState};
};

export default useData;
