import { gql } from '@apollo/client';
export const GAME_INIT_QUERY = gql`
    query roomData($roomId: ID!) {
        roomData(roomId: $roomId) {
            player1
            {
                id
                character
            }
            player2
            {
                id
                character
            }
        }
    }
`;