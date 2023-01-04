const Subscription = {
  roomActSub: {
    subscribe :(parent, {roomId}, {pubsub}) => {
      return pubsub.subscribe(`room ${roomId}`);
    }
  },
  dataSub: {
    subscribe :(parent, {playerId}, {pubsub}) => {
      return pubsub.subscribe(`game ${playerId}`);
    }
  },
};

export { Subscription as default };
