class M4Sound {
  constructor() {
    this.sounds = {}; // Un objeto para almacenar los sonidos precargados
  }

  preloadSounds(soundConfig, onAllLoaded) {
    if (Array.isArray(soundConfig)) {
      let loadedSounds = 0;
      const totalSounds = soundConfig.length;

      soundConfig.forEach((sound) => {
        const { id, src } = sound;

        // Usar Howler.js para precargar el sonido
        this.sounds[id] = new Howl({
          src: [src],
          preload: true, // Precargar el sonido
          onload: () => {
            loadedSounds++;

            if (loadedSounds === totalSounds) {
              // Se han precargado todos los sonidos
              if (typeof onAllLoaded === 'function') {
                onAllLoaded();
              }
            }
          },
          // Puedes agregar más configuraciones personalizadas según tus necesidades
        });
      });
    }
  }

  // Resto de métodos de la clase
  playSound(id, loop = false, onComplete = null, naction) {
      //ojo: a diferencia del resto de metodos, llamarlo sin naction NO detiene la cola
      const sound = this.sounds[id];

      if (sound) {
        sound.loop(loop);

        if (loop) {
          sound.play();
        } else {
          sound.play();

          if (typeof onComplete === 'function') {
            sound.once('end', onComplete);
          }
        }
      }


      lactionEnd(naction);
    }
    stopAllSounds() {
    Object.values(this.sounds).forEach((sound) => {
      sound.stop();
    });
  }


  
}
