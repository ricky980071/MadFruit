import { gql } from '@apollo/client';
export const CREATE_ROOM_MUTATION = gql`
    mutation createRoom($name: String!) {
        createRoom(name: $name) {
            room {
                id
                player1
                {
                    id
                    name
                    character
                    isReady
                }
                player2
                {
                    id
                    name
                    character
                    isReady
                }
            }
            selfId
        }
    }
`;
export const JOIN_ROOM_MUTATION = gql`
    mutation joinRoom($name: String!, $roomId: ID!) {
        joinRoom(name: $name, roomId: $roomId) {
            room {
                id
                player1
                {
                    id
                    name
                    character
                    isReady
                }
                player2
                {
                    id
                    name
                    character
                    isReady
                }
            }
            selfId
            error
        }
    }
`;
export const ROOM_ACT_MUTATION = gql`
    mutation roomAct($roomId:ID!, $playerId:ID!, $act:String!) {
        roomAct(roomId:$roomId, playerId:$playerId, act:$act) {
            id
            name
            character
            isReady
        }
    }
`;
export const PLAYER_DATA_MUTATION = gql`
    mutation playerData($playerId:ID!, $data:String!) {
        playerData(playerId:$playerId, data:$data)
    }
`;
export const REMATCH_MUTATION = gql`
    mutation rejoinRoom($playerId:ID!, $name: String!, $roomId: ID!) {
        rejoinRoom(playerId:$playerId, name:$name, roomId:$roomId) {
            room {
                id
                player1
                {
                    id
                    name
                    character
                    isReady
                }
                player2
                {
                    id
                    name
                    character
                    isReady
                }
            }
            selfId
            error
        }
    }
`;