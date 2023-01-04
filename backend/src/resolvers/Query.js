const Query = {
    roomData: async (parent, {roomId}, {RoomModel}) => {
        let room = await RoomModel.findOne({ id:roomId });
        return room;
    }
};
export default Query;