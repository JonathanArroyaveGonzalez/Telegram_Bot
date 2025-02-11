const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN)

const AppData = [
    { 
      name: "DmWin-App", 
      link: "https://www.dmwin1.com/#/register?invitationCode=", 
      giftCode: "FREE100-DMW", 
      description: "DmWin-App Color Prediction and Number Prediction Robot" 
    },
    { 
      name: "Tiranga", 
      link: "https://tirangaclub.net/#/register?invitationCode=", 
      giftCode: "FREE100-TIR", 
      description: "Tiranga Color Prediction and Number Prediction Robot" 
    }
  ];
  
  // Variables para manejar el canjeo de regalos
  const ADMIN_PASSWORD = "admin24708"; // Contraseña de administrador
  let validGiftCode = "REGALO123"; // Clave válida para canjear
  let redeemedUsers = new Map(); // Almacena los IDs de usuarios y sus datos
  let maxWinners = 1; // Número máximo de ganadores
  let giftMessage = "🎁 ¡Disfruta de tu recompensa!"; // Mensaje del regalo
  let buttonText = "🎁 Canjear Regalo"; // Texto inicial del botón
  
  
  // Función para manejar el canjeo de regalos
  async function handleClaim(ctx) {
    // Verificar si ya se alcanzó el número máximo de ganadores
    if (redeemedUsers.size >= maxWinners) {
      return ctx.reply("❌ Lo siento, la clave ya fue canjeada.");
    }
  
    // Solicitar la clave al usuario
    await ctx.reply("🔑 Por favor, ingresa la clave para canjear tu regalo:");
    
    // Escuchar la respuesta del usuario
    bot.on('text', async (ctx) => {
      const userInput = ctx.message.text.trim();
      const userId = ctx.from.id;
  
      // Verificar si el usuario ya canjeó
      if (redeemedUsers.has(userId)) {
        return ctx.reply("❌ Ya has canjeado tu regalo.");
      }
  
      // Validar la clave
      if (userInput === validGiftCode) {
        redeemedUsers.set(userId, { 
          username: ctx.from.username || ctx.from.first_name, 
          timestamp: new Date() 
        }); // Registrar al usuario
        await ctx.reply("🎉 ¡Felicidades! Has canjeado tu regalo correctamente.");
        await ctx.replyWithMarkdown(giftMessage);
      } else {
        await ctx.reply("❌ Clave inválida. Inténtalo de nuevo.");
      }
    });
  }
  
  // Comandos de administración
  bot.command('admin', async (ctx) => {
    const password = ctx.message.text.split(" ")[1];
    if (password === ADMIN_PASSWORD) {
      await ctx.replyWithMarkdown("✅ *Acceso de administrador concedido.*\n\nUsa los comandos:\n`/maxwinner` - Establecer número de ganadores\n`/winner` - Ver ganadores\n`/gift` - Establecer mensaje del regalo\n`/changekey` - Cambiar clave de canjeo\n`/clear` - Limpiar lista de usuarios canjeados \n`/changeDynamic` - Cambiar texto del botón de canjeo");
    } else {
      await ctx.reply("❌ Contraseña incorrecta.");
    }
  });
  
  /**
   * Comando para limpiar la lista de usuarios canjeados.
   */
  bot.command('clear', async (ctx) => {
    // Verificar la contraseña de administrador
    const password = ctx.message.text.split(" ")[1];
    if (password === ADMIN_PASSWORD) {
        // Limpiar el mapa de usuarios canjeados
        redeemedUsers.clear();
        await ctx.reply("✅ Lista de usuarios canjeados ha sido limpiada correctamente.");
    } else {
        await ctx.reply("❌ Acceso denegado. Contraseña incorrecta.");
    }
  });
  
  
  /**
   * Comando para establecer el número máximo de ganadores.
   */
  bot.command('maxwinner', async (ctx) => {
    const password = ctx.message.text.split(" ")[1];
    if (password === ADMIN_PASSWORD) {
      const newMax = parseInt(ctx.message.text.split(" ")[2]);
      if (!isNaN(newMax) && newMax > 0) {
        maxWinners = newMax;
        await ctx.reply(`✅ Número máximo de ganadores actualizado a: ${maxWinners}`);
      } else {
        await ctx.reply("❌ Valor inválido. Ingresa un número mayor a 0.");
      }
    } else {
      await ctx.reply("❌ Acceso denegado.");
    }
  });
  
  /**
   * Comando para cambiar el texto del botón de canjeo.
   */
  bot.command('changeDynamic', async (ctx) => {
    // Verificar la contraseña de administrador
    const password = ctx.message.text.split(" ")[1];
    if (password === ADMIN_PASSWORD) {
        // Obtener el nuevo texto del botón (todo lo que sigue después de la contraseña)
        const newButtonText = ctx.message.text.split(" ").slice(2).join(" ");
        if (newButtonText) {
            // Actualizar el texto del botón
            buttonText = newButtonText;
            await ctx.reply(`✅ Texto del botón actualizado a: "${buttonText}"`);
        } else {
            await ctx.reply("❌ Texto inválido. Ingresa un texto válido.");
        }
    } else {
        await ctx.reply("❌ Acceso denegado. Contraseña incorrecta.");
    }
  });
  
  /**
   * Comando para ver la lista de ganadores.
   */
  bot.command('winner', async (ctx) => {
    const password = ctx.message.text.split(" ")[1];
    if (password === ADMIN_PASSWORD) {
      if (redeemedUsers.size === 0) {
        await ctx.reply("❌ No hay ganadores aún.");
      } else {
        let winnerList = "🏆 *Lista de Ganadores:*\n\n";
        redeemedUsers.forEach((user, userId) => {
          winnerList += `👤 ${user.username} - 🕒 ${user.timestamp.toLocaleString()}\n`;
        });
        await ctx.replyWithMarkdown(winnerList);
      }
    } else {
      await ctx.reply("❌ Acceso denegado.");
    }
  });
  
  bot.command('gift', async (ctx) => {
    const password = ctx.message.text.split(" ")[1];
    if (password === ADMIN_PASSWORD) {
      const newGiftMessage = ctx.message.text.split(" ").slice(2).join(" ");
      if (newGiftMessage) {
        giftMessage = newGiftMessage;
        await ctx.reply(`✅ Mensaje del regalo actualizado a:\n\n${giftMessage}`);
      } else {
        await ctx.reply("❌ Mensaje inválido. Ingresa un texto válido.");
      }
    } else {
      await ctx.reply("❌ Acceso denegado.");
    }
  });
  
  // Nuevo comando para cambiar la clave de canjeo
  bot.command('changekey', async (ctx) => {
    const password = ctx.message.text.split(" ")[1];
    if (password === ADMIN_PASSWORD) {
      const newKey = ctx.message.text.split(" ")[2];
      if (newKey) {
        validGiftCode = newKey;
        await ctx.reply(`✅ Clave de canjeo actualizada a: ${validGiftCode}`);
      } else {
        await ctx.reply("❌ Clave inválida. Ingresa una clave válida.");
      }
    } else {
      await ctx.reply("❌ Acceso denegado.");
    }
  });
  
  // Menú principal
  bot.command('start', async (ctx) => {
    const menu = [
      [{ text: buttonText, callback_data: 'claim_gift' }]
    ];
    await ctx.replyWithMarkdown('*🎉 Bienvenido al bot de Dinámicas de Friends School! 🎉*\n\nSelecciona una opción:', {
      reply_markup: { inline_keyboard: menu }
    });
  });
  
  // Manejador para el botón de canjeo
  bot.action('claim_gift', async (ctx) => {
    await handleClaim(ctx);
  });
  
  // Manejador para retroceder al menú principal
  bot.action('back_to_main', async (ctx) => {
    const menu = [
      [{ text: buttonText, callback_data: 'claim_gift' }]
    ];
    await ctx.editMessageText('*🎉 Bienvenido al bot de Dinámicas de Friends School! 🎉*\n\nSelecciona una opción:', {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: menu }
    });
  });

// Configurar el webhook
const webhook = process.env.NETLIFY_URL ? `${process.env.NETLIFY_URL}/.netlify/functions/bot` : '';
if (webhook) {
  bot.telegram.setWebhook(webhook);
}

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { 
        statusCode: 405, 
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }

    const update = JSON.parse(event.body);
    await bot.handleUpdate(update);
    
    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: 'Success' })
    };
  } catch (error) {
    console.error('Error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
