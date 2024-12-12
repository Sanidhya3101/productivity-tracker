import { spawn } from 'child_process';

class ScriptManager {
  constructor() {
    if (!ScriptManager.instance) {
      this.scripts = [];
      ScriptManager.instance = this;
    }
    return ScriptManager.instance;
  }

  startScripts() {
    return new Promise((resolve, reject) => {
      try {
        // Start first Python script
        const script1 = spawn('python', [
          'C:/Users/meena/OneDrive/Desktop/productivity-tracker/src/utils/pythonInputCaptures/key_press.py',
        ]);

        script1.stdout.on('data', (data) => {
          console.log(`Script1: ${data}`);
        });

        script1.stderr.on('data', (data) => {
          console.error(`Script1 Error: ${data}`);
        });

        // Start second Python script
        const script2 = spawn('python', [
          'C:/Users/meena/OneDrive/Desktop/productivity-tracker/src/utils/pythonInputCaptures/mouse_clicks.py',
        ]);

        script2.stdout.on('data', (data) => {
          console.log(`Script2: ${data}`);
        });

        script2.stderr.on('data', (data) => {
          console.error(`Script2 Error: ${data}`);
        });

        this.scripts.push(script1, script2);

        console.log('Python scripts started.');
        resolve();
      } catch (error) {
        console.error('Error starting Python scripts:', error);
        reject(error);
      }
    });
  }

  stopScripts() {
    return new Promise((resolve, reject) => {
      try {
        this.scripts.forEach((script) => {
          if (!script.killed) {
            script.kill('SIGINT'); // Gracefully terminate
            console.log(`Script with PID ${script.pid} stopped.`);
          }
        });
        this.scripts.length = 0; // Clear the scripts array without reassigning
        resolve();
      } catch (error) {
        console.error('Error stopping Python scripts:', error);
        reject(error);
      }
    });
  }
}

const instance = new ScriptManager();
Object.freeze(instance);

export default instance;
