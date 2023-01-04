import ShortUniqueId from 'short-unique-id'
const uid = new ShortUniqueId({ length: 4 });
const Mutation = {
  createRoom:  async (parent, {name}, {RoomModel}) => {
    //generate short uid
    const roomId = uid();
    const playerId = uid();
    //create room
    let Room = await new RoomModel({ id:roomId, player1:{id:playerId, name:name, isReady:0, character:0}} ).save();
    const returnRoom = {room:Room, selfId:playerId};

    return returnRoom;
  },

  joinRoom: async (parent, {name, roomId}, {RoomModel, pubsub}) => {
    //find room with roomId
    let room = await RoomModel.findOne({ id:roomId });
    //no room
    if(!room) {
      const error = {error:"room does not exist"}
      return error
    }
    //room is full
    if(room.player1.id && room.player2.id) {
      const error = {error:"this room is full"}
      return error
    }
    //room is available
    const playerId = uid();//generate player Id
    const newPlayer = room.player1.id ?
      {player2:{id:playerId, name:name, isReady:0, character:0}} :
      {player1:{id:playerId, name:name, isReady:0, character:0}} ;

    let joinRoom = await RoomModel.findOneAndUpdate({ id:roomId }, newPlayer, {new: true})

    const returnRoom = {room:joinRoom, selfId:playerId};

    pubsub.publish(`room ${roomId}`, {
    roomActSub: {
      id:playerId,
      name:name,
      character:0,
      isReady:0,
    }
   });

    return returnRoom;
  },

  roomAct: async (parent, {roomId, playerId, act}, {RoomModel, pubsub}) => {
    //find room with roomId
    let room = await RoomModel.findOne({ id:roomId });
    let idx = 0;
    if(room.player1)
    {
      if(room.player1.id === playerId)
      {
        idx = 1;
      }
    }
    else if(room.player2)
    {
      if(room.player2.id === playerId)
      {
        idx = 2;
      }
    }
    else //player notFound
    {
      return;
    }

    switch(act)
    {
      case "toggleReady":
        let newReady = (idx===1 ? (!room.player1.isReady) : (!room.player2.isReady));
        let updatePlayer = (idx===1 ? {player1:{...room.player1, isReady:newReady}} : {player2:{...room.player2, isReady:newReady}});
        await RoomModel.findOneAndUpdate({ id:roomId }, updatePlayer, {new:true});
        break;
      case "Leave":
        if(idx===1) 
        {
          await RoomModel.findOneAndUpdate({ id:roomId }, {player1:null}, {new:true});//delete player
          if(!room.player2.id) await RoomModel.findOneAndDelete({ id:roomId });//destroy empty room
        }
        else
        {
          await RoomModel.findOneAndUpdate({ id:roomId }, {player2:null}, {new:true});//delete player
          if(!room.player1.id) await RoomModel.findOneAndDelete({ id:roomId });//destroy empty room
        }
        const error = {error: `Player ${playerId} left the room`, id: playerId};
        pubsub.publish(`room ${roomId}`, {
          roomActSub: error
        });
        return error;
        break;
      case "leftBtn":
      case "rightBtn":
        //handle character switching here
        const change = (act === "leftBtn")? -1:1;
        let newCharacter = (idx===1 ? room.player1.character : room.player2.character )+ change;
        //make sure index is not out of range
        if(newCharacter >= 2)
        {
          newCharacter = 0;
        }
        if(newCharacter < 0)
        {
          newCharacter = 1;
        }
        let modifiedPlayer = (idx===1 ? {player1:{...room.player1, character: newCharacter}} : {player2:{...room.player2, character: newCharacter}});
        await RoomModel.findOneAndUpdate({ id:roomId }, modifiedPlayer, {new:true});
        break;
    }
    let newroom = await RoomModel.findOne({ id:roomId });//get new room to publish
    const returnPlayer = (idx===1?newroom.player1:newroom.player2);
    pubsub.publish(`room ${roomId}`, {
      roomActSub: returnPlayer
    });
    return returnPlayer;
  },

  playerData: (parent, {playerId, data}, {pubsub}) => {
    pubsub.publish(`game ${playerId}`, {
      dataSub: {
        id: playerId,
        data: data,
      }
    });
  },

  rejoinRoom: async(parent, {playerId, name, roomId}, {RoomModel, pubsub}) => {
    //find room with roomId
    let room = await RoomModel.findOne({ id:roomId });
    //no room => create one
    if(!room) {
      let Room = await new RoomModel({ id:roomId, player1:{id:playerId, name:name, isReady:0, character:0}} ).save();
      const returnRoom = {room:Room, selfId:playerId};
      return returnRoom;
    }
    //room full => error
    if(room.player1.id && room.player2.id) {
      const error = {error:"this room is full"}
      return error
    }
    //room is available
    const newPlayer = room.player1.id ?
      {player2:{id:playerId, name:name, isReady:0, character:0}} :
      {player1:{id:playerId, name:name, isReady:0, character:0}} ;

    let joinRoom = await RoomModel.findOneAndUpdate({ id:roomId }, newPlayer, {new: true})

    const returnRoom = {room:joinRoom, selfId:playerId};

    pubsub.publish(`room ${roomId}`, {
      roomActSub: {
        id:playerId,
        name:name,
        character:0,
        isReady:0,
      }
    });
    return returnRoom;
  }
};

export { Mutation as default };