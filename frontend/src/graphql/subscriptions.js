import { gql } from '@apollo/client';
export const ROOM_ACT_SUBSCRIPTION = gql`
    subscription roomActSub($roomId:ID!) {
        roomActSub(roomId:$roomId) {
            id
            name
            character
            isReady
            error
        }
    }
`;
export const PLAYER_DATA_SUBSCRIPTION = gql`
    subscription dataSub($playerId:ID!) {
        dataSub(playerId:$playerId) {
            id
            data
        }
    }
`;