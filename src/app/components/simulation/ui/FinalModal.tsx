import React, { FC } from 'react';
import { IFinalModal } from '@/types';

interface FinalModalProps {
  modalData: IFinalModal;
}

const FinalModal: FC<FinalModalProps> = ({ modalData }) => {
  if (!modalData.visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      {modalData.type === 'good' ? (
        <div className="bg-gray-800 border border-green-500 text-white p-6 rounded-lg max-w-sm w-full shadow-2xl text-center">
          <h2 className="text-2xl font-bold mb-3 text-green-400">Final Bueno</h2>
          <img src="/happy.png" alt="Población Feliz" className="mx-auto my-4 w-24 h-24 rounded-full border-2 border-green-400" />
          <p className="text-sm mb-2">¡Salvaste a la población!</p>
          <p className="text-xs text-gray-300 mb-5">Felicidades, usaste los recursos de forma responsable lo cual permitió que la población permanezca estable.</p>
        </div>
      ) : (
        <div className="bg-gray-800 border border-red-500 text-white p-6 rounded-lg max-w-sm w-full shadow-2xl text-center">
          <h2 className="text-2xl font-bold mb-3 text-red-400">Final Malo</h2>
          <img src="/sad.png" alt="Población Triste" className="mx-auto my-4 w-24 h-24 rounded-full border-2 border-red-400" />
          <p className="text-sm mb-2">Generaste una hambruna...</p>
          <p className="text-xs text-gray-300 mb-5">Los recursos se agotaron, lo que hizo que la población no prospere y colapse.</p>
        </div>
      )}
    </div>
  );
};

export default FinalModal;