import { useEffect, useCallback } from 'react';
import { Unity } from 'react-unity-webgl';
import { useGamePage } from './hooks/useGamePage';
import useData from './hooks/useData';

const GamePage = () => {
    const { unityProvider, addEventListener, removeEventListener, name } = useGamePage();
    const { id, roomId, createRoom, joinRoom, roomAct, setPlayerData, initData, rematch, leaveRoom,
      rejoinRoom, gameState, setGameState } = useData();
    
    //message handling functions
    //handlers for menu
    const handleCreate = useCallback(() => {
      createRoom({variables: {name:name}});
    },[createRoom, name]);
    const handleJoin = useCallback((Id) => {
      joinRoom({variables:{name:name, roomId: Id}});
    },[joinRoom, name]);
    const handleRoomAct = useCallback((Act) => {
      if(Act==="Back")
      {
        leaveRoom();
        return;
      }
      else if(Act==="Rematch")
      {
        rejoinRoom({variables:{playerId:id, name:name, roomId:roomId}});
        leaveRoom();
        return;
      }
      else if(Act==="AFK")
      {
        console.log("AFK");
        roomAct({variables:{roomId: roomId, playerId: id, act: "Leave"}});
        return;
      }
      if(gameState!=="Waiting")
      {
        return;
      }
      roomAct({variables:{roomId: roomId, playerId: id, act: Act}});
      if(Act === 'Leave')
      {
        leaveRoom();
      }

    },[roomAct, roomId, id, leaveRoom, rejoinRoom, gameState]); 
    //handler for game manager
    const handleRoomData = useCallback(() => {
      if(gameState==="Waiting")
      {
        initData({variables:{
          roomId: roomId
        }});
        setGameState("Init_Game");
      }
      else
      {
        rematch();
      }        
    },[initData, roomId, rematch, gameState, setGameState])
    //handler for player
    const handlePlayerData = useCallback((data) => {
      if(gameState!=="Game"&&gameState!=="First_Game")
      {
        return;
      }
      setPlayerData({variables:{
          playerId: id,
          data: data,
      }})
    }, [setPlayerData, id, gameState]);
    //message listening hooks
    //listeners for menus
    useEffect(() => {
        addEventListener("createRoom", handleCreate);
        return () => {
          removeEventListener("createRoom", handleCreate);
        };
    }, [addEventListener, removeEventListener, handleCreate]);
    useEffect(() => {
        addEventListener("joinRoom", handleJoin);
        return () => {
          removeEventListener("joinRoom", handleJoin);
        };
    }, [addEventListener, removeEventListener, handleJoin]);
    useEffect(() => {
        addEventListener("roomAct", handleRoomAct);
        return () => {
          removeEventListener("roomAct", handleRoomAct);
        };
    }, [addEventListener, removeEventListener, handleRoomAct]);
    //listener for game manager
    useEffect(() => {
        addEventListener("getRoomData", handleRoomData);
        return () => {
          removeEventListener("getRoomData", handleRoomData);
        };
    }, [addEventListener, removeEventListener, handleRoomData]);
    //listener for player
    useEffect(() => {
        addEventListener("sendPlayerData", handlePlayerData);
        return () => {
          removeEventListener("sendPlayerData", handlePlayerData);
        };
    }, [addEventListener, removeEventListener, handlePlayerData]);
    return (
        <>
            <Unity unityProvider={unityProvider} style={{ width: 960, height: 540 } } />
        </>
    );
}

export default GamePage;