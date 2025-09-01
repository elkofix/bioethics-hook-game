import { db } from '@/lib/firebase';
import { GameResult } from '@/types';
import { addDoc, collection, doc, updateDoc, onSnapshot, Unsubscribe, DocumentData, getDoc, query, writeBatch, getDocs } from 'firebase/firestore';

export const registerGameResult = async (outcome: 'win' | 'lose'): Promise<void> => {
  try {
    await addDoc(collection(db, 'game_results'), { outcome });
    console.log(`Resultado '${outcome}' registrado.`);
  } catch (error) {
    console.error("Error registrando resultado:", error);
  }
};

export const subscribeToGameState = (
    callback: (data: DocumentData) => void
): Unsubscribe => {
    const gameStateRef = doc(collection(db, 'game_state'), 'status');
    const unsubscribe = onSnapshot(gameStateRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    });
    return unsubscribe;
};

/**
 * Obtiene el estado actual del juego desde Firestore.
 * @returns {Promise<boolean>} Devuelve `true` si el juego está iniciado, `false` en caso contrario.
 */
export const getGameState = async (): Promise<boolean> => {
    try {
        const gameStateRef = doc(collection(db, 'game_state'), 'status');
        const docSnap = await getDoc(gameStateRef);
        
        if (docSnap.exists()) {
            return docSnap.data().isStarted as boolean;
        }
        // Si el documento no existe, asumimos que el juego no ha comenzado.
        console.warn("Documento de estado no encontrado, devolviendo 'false'.");
        return false;
    } catch (error) {
        console.error("Error obteniendo el estado del juego:", error);
        return false; // Devuelve un estado seguro en caso de error
    }
};

/**
 * Actualiza el estado de inicio del juego en Firestore.
 * @param {boolean} isStarted - El nuevo estado del juego.
 */
export const updateGameStartedState = async (isStarted: boolean): Promise<void> => {
    try {
        const gameStateRef = doc(collection(db, 'game_state'), 'status');
        await updateDoc(gameStateRef, { isStarted });
    } catch (error) {
        console.error("Error actualizando el estado del juego:", error);
        // Lanza el error para que el componente que llama pueda manejarlo
        throw error;
    }
};

/**
 * Se suscribe a los resultados del juego en tiempo real.
 * @param callback - Una función que se llama cada vez que los resultados cambian.
 * @returns Una función para cancelar la suscripción.
 */
export const subscribeToGameResults = (
    callback: (results: GameResult[]) => void
): Unsubscribe => {
    const q = query(collection(db, 'game_results'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const resultsData: GameResult[] = [];
        querySnapshot.forEach((doc) => {
            resultsData.push({ id: doc.id, ...doc.data() } as GameResult);
        });
        callback(resultsData);
    });

    return unsubscribe;
};

/**
 * Elimina todos los documentos de la colección 'game_results'.
 * @returns Una promesa que se resuelve cuando la operación ha terminado.
 */
export const clearAllGameResults = async (): Promise<void> => {
    try {
        const resultsCollection = collection(db, 'game_results');
        const querySnapshot = await getDocs(resultsCollection);

        if (querySnapshot.empty) {
            console.log("No hay resultados que eliminar.");
            return;
        }

        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    } catch (error) {
        console.error("Error eliminando todos los resultados:", error);
        throw error; // Propagamos el error para que el componente lo maneje
    }
};