// src/Components/Common/verificarHorario.js
export const checkWingoolStatus = () => {
  const ahora = new Date();
  const dia = ahora.getDay(); 
  const hora = ahora.getHours() + ahora.getMinutes() / 60;

  const config = {
    abierto: 13.0, // 1:00 PM
    cierre: 22.0,   // 10:00 PM
    esLunes: dia === 3
  };

  let status = "ABIERTO";
  if (config.esLunes) status = "LUNES";
  else if (hora < config.abierto) status = "PREPARANDO";
  else if (hora >= config.cierre) status = "FINALIZADO";

  return {
    isClosed: status !== "ABIERTO",
    status, // "LUNES", "PREPARANDO" o "FINALIZADO"
  };
};