import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Shield, Rocket, Star } from 'lucide-react';

const SpaceShooter = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  const gameRef = useRef({
    player: { x: 400, y: 500, width: 40, height: 40, speed: 6 },
    bullets: [],
    enemies: [],
    asteroids: [],
    powerUps: [],
    particles: [],
    keys: {},
    powerUpActive: null,
    powerUpTimer: 0,
    doubleShotActive: false,
    shieldActive: false,
    enemySpawnTimer: 0,
    asteroidSpawnTimer: 0,
    powerUpSpawnTimer: 0,
  });

  // Load high score from storage
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const result = await window.storage.get('space-shooter-highscore');
        if (result?.value) {
          setHighScore(parseInt(result.value));
        }
      } catch (error) {
        console.log('No high score found');
      }
    };
    loadHighScore();
  }, []);

  // Save high score
  const saveHighScore = async (score) => {
    try {
      await window.storage.set('space-shooter-highscore', score.toString());
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    
    const game = gameRef.current;
    game.player = { x: 400, y: 500, width: 40, height: 40, speed: 6 };
    game.bullets = [];
    game.enemies = [];
    game.asteroids = [];
    game.powerUps = [];
    game.particles = [];
    game.powerUpActive = null;
    game.powerUpTimer = 0;
    game.doubleShotActive = false;
    game.shieldActive = false;
    game.enemySpawnTimer = 0;
    game.asteroidSpawnTimer = 0;
    game.powerUpSpawnTimer = 0;
  };

  const createParticles = (x, y, color, count = 10) => {
    const game = gameRef.current;
    for (let i = 0; i < count; i++) {
      game.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        color,
        size: Math.random() * 3 + 2
      });
    }
  };

  const shoot = () => {
    const game = gameRef.current;
    const { player } = game;
    
    if (game.doubleShotActive) {
      game.bullets.push({
        x: player.x + player.width / 2 - 10,
        y: player.y,
        width: 4,
        height: 15,
        speed: 10,
        color: '#00ffff'
      });
      game.bullets.push({
        x: player.x + player.width / 2 + 10,
        y: player.y,
        width: 4,
        height: 15,
        speed: 10,
        color: '#00ffff'
      });
    } else {
      game.bullets.push({
        x: player.x + player.width / 2,
        y: player.y,
        width: 4,
        height: 15,
        speed: 10,
        color: '#00ffff'
      });
    }
  };

  const spawnEnemy = () => {
    const game = gameRef.current;
    game.enemies.push({
      x: Math.random() * 760,
      y: -40,
      width: 35,
      height: 35,
      speed: 2 + Math.random() * 2,
      health: 2,
      shootTimer: Math.random() * 60
    });
  };

  const spawnAsteroid = () => {
    const game = gameRef.current;
    const size = 30 + Math.random() * 30;
    game.asteroids.push({
      x: Math.random() * 760,
      y: -60,
      width: size,
      height: size,
      speed: 1 + Math.random() * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    });
  };

  const spawnPowerUp = () => {
    const game = gameRef.current;
    const types = ['doubleShot', 'shield', 'speed'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    game.powerUps.push({
      x: Math.random() * 760,
      y: -30,
      width: 30,
      height: 30,
      speed: 2,
      type
    });
  };

  const checkCollision = (a, b) => {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  };

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const game = gameRef.current;

    // Clear canvas
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw star background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % 800;
      const y = ((i * 73 + Date.now() * 0.02) % 600);
      ctx.fillRect(x, y, 1, 1);
    }

    // Update and draw particles
    game.particles = game.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      
      if (p.life > 0) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
        return true;
      }
      return false;
    });

    // Player movement
    const { player, keys } = game;
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
    if (keys.ArrowDown && player.y < canvas.height - player.height) player.y += player.speed;

    // Draw player
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    
    if (game.shieldActive) {
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, player.width / 2 + 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.fillStyle = '#ff006e';
    ctx.beginPath();
    ctx.moveTo(0, -player.height / 2);
    ctx.lineTo(-player.width / 2, player.height / 2);
    ctx.lineTo(0, player.height / 3);
    ctx.lineTo(player.width / 2, player.height / 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#ffbe0b';
    ctx.fillRect(-4, player.height / 3, 8, 8);
    ctx.restore();

    // Update and draw bullets
    game.bullets = game.bullets.filter(bullet => {
      bullet.y -= bullet.speed;
      
      ctx.fillStyle = bullet.color;
      ctx.shadowColor = bullet.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0;
      
      return bullet.y > -bullet.height;
    });

    // Spawn enemies
    game.enemySpawnTimer++;
    if (game.enemySpawnTimer > 60) {
      spawnEnemy();
      game.enemySpawnTimer = 0;
    }

    // Update and draw enemies
    game.enemies = game.enemies.filter(enemy => {
      enemy.y += enemy.speed;

      // Enemy shooting
      enemy.shootTimer--;
      if (enemy.shootTimer <= 0) {
        game.bullets.push({
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height,
          width: 4,
          height: 12,
          speed: -6,
          color: '#ff006e',
          isEnemy: true
        });
        enemy.shootTimer = 90 + Math.random() * 60;
      }

      ctx.fillStyle = '#8338ec';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      ctx.fillStyle = '#3a86ff';
      ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.width - 10, enemy.height - 10);

      // Check bullet collisions with enemies
      for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        if (!bullet.isEnemy && checkCollision(bullet, enemy)) {
          game.bullets.splice(i, 1);
          enemy.health--;
          
          createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#8338ec', 5);
          
          if (enemy.health <= 0) {
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#8338ec', 15);
            setScore(s => s + 100);
            return false;
          }
        }
      }

      return enemy.y < canvas.height + 50;
    });

    // Spawn asteroids
    game.asteroidSpawnTimer++;
    if (game.asteroidSpawnTimer > 80) {
      spawnAsteroid();
      game.asteroidSpawnTimer = 0;
    }

    // Update and draw asteroids
    game.asteroids = game.asteroids.filter(asteroid => {
      asteroid.y += asteroid.speed;
      asteroid.rotation += asteroid.rotationSpeed;

      ctx.save();
      ctx.translate(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
      ctx.rotate(asteroid.rotation);
      ctx.fillStyle = '#6c757d';
      ctx.fillRect(-asteroid.width / 2, -asteroid.height / 2, asteroid.width, asteroid.height);
      ctx.fillStyle = '#495057';
      ctx.fillRect(-asteroid.width / 3, -asteroid.height / 3, asteroid.width * 0.66, asteroid.height * 0.66);
      ctx.restore();

      // Check bullet collisions with asteroids
      for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        if (!bullet.isEnemy && checkCollision(bullet, asteroid)) {
          game.bullets.splice(i, 1);
          createParticles(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2, '#6c757d', 10);
          setScore(s => s + 50);
          return false;
        }
      }

      return asteroid.y < canvas.height + 50;
    });

    // Check enemy bullet collisions with player
    for (let i = game.bullets.length - 1; i >= 0; i--) {
      const bullet = game.bullets[i];
      if (bullet.isEnemy && checkCollision(bullet, player)) {
        game.bullets.splice(i, 1);
        
        if (!game.shieldActive) {
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
              if (score > highScore) {
                setHighScore(score);
                saveHighScore(score);
              }
            }
            return newLives;
          });
          createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ff006e', 20);
        } else {
          createParticles(player.x + player.width / 2, player.y + player.height / 2, '#00ff88', 10);
        }
      }
    }

    // Check collisions with enemies and asteroids
    [...game.enemies, ...game.asteroids].forEach(obj => {
      if (checkCollision(player, obj)) {
        if (!game.shieldActive) {
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
              if (score > highScore) {
                setHighScore(score);
                saveHighScore(score);
              }
            }
            return newLives;
          });
          createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ff006e', 20);
        }
      }
    });

    // Spawn power-ups
    game.powerUpSpawnTimer++;
    if (game.powerUpSpawnTimer > 300) {
      spawnPowerUp();
      game.powerUpSpawnTimer = 0;
    }

    // Update and draw power-ups
    game.powerUps = game.powerUps.filter(powerUp => {
      powerUp.y += powerUp.speed;

      const colors = {
        doubleShot: '#00ffff',
        shield: '#00ff88',
        speed: '#ffbe0b'
      };

      ctx.fillStyle = colors[powerUp.type];
      ctx.shadowColor = colors[powerUp.type];
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Check collision with player
      if (checkCollision(player, powerUp)) {
        createParticles(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, colors[powerUp.type], 15);
        
        if (powerUp.type === 'doubleShot') {
          game.doubleShotActive = true;
          game.powerUpTimer = 300;
        } else if (powerUp.type === 'shield') {
          game.shieldActive = true;
          game.powerUpTimer = 400;
        } else if (powerUp.type === 'speed') {
          player.speed = 10;
          game.powerUpTimer = 250;
        }
        
        game.powerUpActive = powerUp.type;
        return false;
      }

      return powerUp.y < canvas.height + 50;
    });

    // Handle power-up timers
    if (game.powerUpTimer > 0) {
      game.powerUpTimer--;
      if (game.powerUpTimer === 0) {
        game.doubleShotActive = false;
        game.shieldActive = false;
        player.speed = 6;
        game.powerUpActive = null;
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, score, highScore]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      gameRef.current.keys[e.key] = true;
      
      if (e.key === ' ' && gameState === 'playing') {
        shoot();
      }
      
      if (e.key === 'Escape' && gameState === 'playing') {
        setGameState('paused');
      } else if (e.key === 'Escape' && gameState === 'paused') {
        setGameState('playing');
      }
    };

    const handleKeyUp = (e) => {
      gameRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const getPowerUpIcon = () => {
    const game = gameRef.current;
    if (game.doubleShotActive) return <Zap className="w-5 h-5" />;
    if (game.shieldActive) return <Shield className="w-5 h-5" />;
    if (game.powerUpActive === 'speed') return <Rocket className="w-5 h-5" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 font-['Press_Start_2P']">
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      
      <div className="relative">
        {/* HUD */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-4 text-white z-10 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-cyan-400">{score}</span>
            </div>
            <div className="flex gap-1">
              {[...Array(lives)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-red-500 border-2 border-red-300" />
              ))}
            </div>
          </div>
          
          {gameRef.current.powerUpActive && (
            <div className="bg-purple-900/80 px-3 py-2 rounded border-2 border-purple-400 flex items-center gap-2 animate-pulse">
              {getPowerUpIcon()}
              <span className="text-[10px]">{Math.ceil(gameRef.current.powerUpTimer / 60)}s</span>
            </div>
          )}
          
          <div className="text-right space-y-2">
            <div className="text-[10px] text-gray-400">RECORDE</div>
            <div className="text-yellow-400">{highScore}</div>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-4 border-cyan-500 shadow-2xl shadow-cyan-500/50 bg-slate-950"
        />

        {/* Menu Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center space-y-8 p-8">
              <h1 className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse">
                SPACE<br/>SHOOTER
              </h1>
              
              <div className="space-y-4 text-xs text-cyan-300">
                <p>SETAS - Mover</p>
                <p>ESPAÇO - Atirar</p>
                <p>ESC - Pausar</p>
              </div>

              <div className="space-y-3 text-xs text-left bg-slate-900/50 p-4 rounded border-2 border-purple-500">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Zap className="w-4 h-4" />
                  <span>Tiro Duplo</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Shield className="w-4 h-4" />
                  <span>Escudo</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <Rocket className="w-4 h-4" />
                  <span>Velocidade</span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-8 py-4 text-sm border-4 border-white shadow-lg shadow-purple-500/50 hover:shadow-cyan-500/50 transition-all hover:scale-110 active:scale-95"
              >
                INICIAR
              </button>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center space-y-6">
              <h2 className="text-4xl text-cyan-400 animate-pulse">PAUSADO</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setGameState('playing')}
                  className="block w-full bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 text-xs border-2 border-cyan-300"
                >
                  CONTINUAR
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="block w-full bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 text-xs border-2 border-purple-300"
                >
                  MENU
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center space-y-6 p-8">
              <h2 className="text-4xl text-red-500 animate-pulse">GAME OVER</h2>
              
              <div className="space-y-4 text-xl">
                <div>
                  <div className="text-xs text-gray-400 mb-1">PONTUAÇÃO</div>
                  <div className="text-cyan-400">{score}</div>
                </div>
                
                {score === highScore && score > 0 && (
                  <div className="text-yellow-400 text-sm animate-bounce">
                    🏆 NOVO RECORDE! 🏆
                  </div>
                )}
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">RECORDE</div>
                  <div className="text-yellow-400">{highScore}</div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={startGame}
                  className="block w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white px-8 py-3 text-xs border-2 border-white transition-all hover:scale-105"
                >
                  JOGAR NOVAMENTE
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="block w-full bg-purple-700 hover:bg-purple-600 text-white px-8 py-3 text-xs border-2 border-purple-400"
                >
                  MENU
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceShooter;