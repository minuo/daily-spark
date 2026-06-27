import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, setDoc, deleteDoc, doc } from 'firebase/firestore';

export type NoteItem = {
  id: string; // unique note id
  itemId: string; // id of the quote/poem/book
  type: 'quote' | 'poem' | 'book' | 'history' | 'idiom';
  itemData: any;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export const useNotes = () => {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('daily_spark_notes');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Unsubscribe from auth and firestore when unmounted
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsSyncing(true);
        const q = query(collection(db, `users/${user.uid}/notes`));
        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const fetchedNotes: NoteItem[] = [];
            snapshot.forEach((doc) => {
              fetchedNotes.push({ ...doc.data(), id: doc.id } as NoteItem);
            });
            // Sort descending by updatedAt
            fetchedNotes.sort((a, b) => b.updatedAt - a.updatedAt);
            setNotes(fetchedNotes);
            localStorage.setItem('daily_spark_notes', JSON.stringify(fetchedNotes));
            setIsSyncing(false);
          },
          (error) => {
            console.warn("Firestore notes snapshot failed, using local storage cache.", error);
            setIsSyncing(false);
          }
        );
        return () => unsubscribe();
      } else {
        // Not authenticated: load from localStorage
        const saved = localStorage.getItem('daily_spark_notes');
        try {
          setNotes(saved ? JSON.parse(saved) : []);
        } catch {
          setNotes([]);
        }
        setIsSyncing(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const addOrUpdateNote = async (itemId: string, type: any, itemData: any, content: string) => {
    const user = auth.currentUser;

    if (!content.trim()) {
      // if empty, remove it
      await deleteNote(itemId);
      return;
    }

    const noteId = `note_${itemId}`;
    const existing = notes.find((n) => n.itemId === itemId);
    let newNote: NoteItem;

    if (existing) {
      newNote = {
        ...existing,
        content,
        updatedAt: Date.now()
      };
    } else {
      newNote = {
        id: noteId,
        itemId,
        type,
        itemData,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    }

    // Update local state and cache first (Optimistic Update)
    const updatedNotes = existing
      ? notes.map((n) => (n.itemId === itemId ? newNote : n))
      : [newNote, ...notes];

    updatedNotes.sort((a, b) => b.updatedAt - a.updatedAt);
    setNotes(updatedNotes);
    localStorage.setItem('daily_spark_notes', JSON.stringify(updatedNotes));

    // Async sync to Firestore
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/notes`, noteId);
        await setDoc(docRef, newNote);
      } catch (err) {
        console.error("Firestore sync addOrUpdateNote failed:", err);
      }
    }
  };

  const deleteNote = async (itemId: string) => {
    const user = auth.currentUser;
    const noteId = `note_${itemId}`;

    // Update local state first (Optimistic Update)
    const updatedNotes = notes.filter((n) => n.itemId !== itemId);
    setNotes(updatedNotes);
    localStorage.setItem('daily_spark_notes', JSON.stringify(updatedNotes));

    // Async sync to Firestore
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/notes`, noteId);
        await deleteDoc(docRef);
      } catch (err) {
        console.error("Firestore sync deleteNote failed:", err);
      }
    }
  };

  const getNoteByItemId = (itemId: string) => {
    return notes.find((n) => n.itemId === itemId);
  };

  return { notes, addOrUpdateNote, deleteNote, getNoteByItemId, isSyncing };
};

