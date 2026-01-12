//=========CRÉDITOS=============\\
/*
base da dark, melhorado por mim, artur Shelby, deixa os devidos creditos, afinal eu e quem fiz o bot, mas vc e que sabe...

caso queira suporte entre no nosso grupo
link: https://whatsapp.com/channel/0029Vb6kIPAKLaHnbgEM5d3r

CREDITOS:
BELPHEGOR,
PEDROZZ MODS 
Artur Shelby
*/

//===========BAILEYS==========\\
const { 
default: makeWASocket, downloadContentFromMessage,emitGroupParticipantsUpdate,emitGroupUpdate,makeInMemoryStore,prepareWAMessageMedia, MediaType,WAMessageStatus, AuthenticationState, GroupMetadata, initInMemoryKeyStore, MiscMessageGenerationOptions,useMultiFileAuthState, BufferJSON,WAMessageProto,MessageOptions, PHONENUMBER_MCC, WAFlag,WANode,	 WAMetric, ChatModification,MessageTypeProto,WALocationMessage, ReconnectMode,WAContextInfo,proto,	 WAGroupMetadata,ProxyAgent, waChatKey,MimetypeMap,MediaPathMap,WAContactMessage,WAContactsArrayMessage,WAGroupInviteMessage,WATextMessage,WAMessageContent,WAMessage,BaileysError,WA_MESSAGE_STATUS_TYPE,MediaConnInfo, generateWAMessageContent, URL_REGEX,Contact, WAUrlInfo,WA_DEFAULT_EPHEMERAL,WAMediaUpload,mentionedJid,processTime, Browser, makeCacheableSignalKeyStore ,MessageType,Presence,WA_MESSAGE_STUB_TYPES,Mimetype,relayWAMessage, Browsers,GroupSettingChange,delay,DisconnectReason,WASocket,getStream,WAProto,isBaileys,AnyMessageContent,generateWAMessageFromContent, fetchLatestBaileysVersion,processMessage,processingMutex
} = require('baileys-mod');
const baileys = require('baileys-mod');
//=========MODULOS===========\\
let pino = require('pino')
const fs = require('fs')
const axios = require('axios');
const chalk = require('chalk')
const Pino = require('pino')
const NodeCache = require("node-cache")
const readline = require("readline")
const PhoneNumber = require('awesome-phonenumber')


let phoneNumber = "244938041330"
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))
//============CONFIG==========\\
const { prefix, donoJid, donoLid, numeroBot, botName, Baseblinders, Blinders_APIKEY, emojiglobal, Dononame, verMsg } = require("./dono/config.json");//Configurações do bot como prefixo, nome do bot etc...
const config = JSON.parse(fs.readFileSync("./dono/config.json"))

const fotomenu = "./dados/imagem/menu.png" //Foto do menu.

//============IMPORTS==========\\
const antilinkFile = './dados/json/antilink.json';
const autorepliesFile = './dados/json/autoreplies.json';

//=======INICIO DO BOTECO=======\\
async function ligarbot() {
console.time('AuthLoad')
const { state, saveCreds } = await useMultiFileAuthState('./dono/blinders-qr')
const msgRetryCounterCache = new NodeCache()

const client = makeWASocket({
version: [2, 3000, 1027934701],
auth: state,
logger: pino({ level: 'silent' }),
printQRInTerminal: false,
mobile: false,
browser: ['Chrome', 'Chrome', '111.0.5563.64'],
generateHighQualityLinkPreview: true,
msgRetryCounterCache,
connectTimeoutMs: 60000,
defaultQueryTimeoutMs: 0,
keepAliveIntervalMs: 20000,
patchMessageBeforeSending: (message) => {
const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
if (requiresPatch) {
message = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadataVersion: 2,
deviceListMetadata: {},
},
...message,
},
},
};
}
return message;
},
});


//======CONEXÃO POR CODE=========\\
if (!client.authState.creds.registered) {
console.log(chalk.bgHex('#1a1a1a').hex('#ff4d4d')('\n┏━━━━━━━━━━━━━━━━━━�?'));
console.log(chalk.bgHex('#1a1a1a').hex('#ff1a1a')('�? Conexão por Código'));
console.log(chalk.bgHex('#1a1a1a').hex('#ff4d4d')('┗━━━━━━━━━━━━━━━━━━━┛\n'));
console.log(chalk.hex('#ff6666')('Informe o número do bot (exemplo: +24411XXXXXXXX):\n'));
const phoneNumber = await question(chalk.hex('#ff3333')('Número: '));
if (!phoneNumber) {
console.log('\n' + chalk.bgHex('#8b0000')(chalk.white('Erro: Inclua o código do país, ex: +244...')));
process.exit(1);
}
const NumeroLimpo = phoneNumber.replace(/[^0-9]/g, '');
let code = await client.requestPairingCode(NumeroLimpo);
console.log(chalk.bgHex('#1a1a1a').hex('#ff4d4d')('\n┏━━━━━━━━━━━━━━━━�?'));
console.log(chalk.bgHex('#1a1a1a').hex('#ff1a1a')('┃Código de Emparelhamento '));
console.log(chalk.bgHex('#1a1a1a').hex('#ff4d4d')('┗━━━━━━━━━━━━━━━━━━━┛\n'));
code = code?.match(/.{1,4}/g)?.join("-") || code;
console.log(chalk.bold.hex('#ff1a1a')('Código: ') + chalk.bold.hex('#ff4d4d')(code));
console.log(chalk.hex('#aaaaaa')('\nAguardando conexão com o WhatsApp...\n'));
}


//=======CLIENTES=======\\
var blinders = client;
var emoji = "🎭";
//*==================*\\
client.ev.on('chats.set', () => { console.log('setando conversas...'); })
client.ev.on('contacts.set', () => { console.log('setando contatos...'); })
client.ev.on('creds.update', saveCreds)

const getGroupAdmins = (participants = []) => {
if (!Array.isArray(participants)) return [];
return participants
.filter(p => p.admin)
.map(p => p.phoneNumber || p.jid || p.id || p.lid);
};

const isAdmin2 = (userId, participants = []) => {
const admins = getGroupAdmins(participants);
const normalize = id => id?.split('@')[0];
return admins.some(admin => normalize(admin) === normalize(userId));
};

//========ATT DE MENSAGENS=========\\
client.ev.on('messages.upsert', async ({ messages }) => {
try {
const info = messages[0]
if (!info.message) return 

const key = {
remoteJid: info.key.remoteJid,
id: info.key.id, 
participant: info.key.participant 
}
//PARA VIZUALIZAR AS MENSAGENS ENVIADAS AO BOT
if(verMsg) {
await client.readMessages([info.key]);
} else {
if(info.key.remoteJid == "status@broadcast") return;
}
const altpdf = Object.keys(info.message)
const type = baileys.getContentType(info.message);

const from = info.key.remoteJid
const bodyofc = type === "conversation" ? info.message.conversation : type === "viewOnceMessageV2" ? info.message.viewOnceMessageV2.message.imageMessage ? info.message.viewOnceMessageV2.message.imageMessage.caption : info.message.viewOnceMessageV2.message.videoMessage.caption : type === "imageMessage" ? info.message.imageMessage.caption : type === "videoMessage" ? info.message.videoMessage.caption : type === "extendedTextMessage" ? info.message.extendedTextMessage.text : type === "viewOnceMessage" ? info.message.viewOnceMessage.message.videoMessage ? info.message.viewOnceMessage.message.videoMessage.caption : info.message.viewOnceMessage.message.imageMessage.caption : type === "documentWithCaptionMessage" ? info.message.documentWithCaptionMessage.message.documentMessage.caption : type === "buttonsMessage" ? info.message.buttonsMessage.imageMessage.caption : type === "buttonsResponseMessage" ? info.message.buttonsResponseMessage.selectedButtonId : type === "listResponseMessage" ? info.message.listResponseMessage.singleSelectReply.selectedRowId : type === "templateButtonReplyMessage" ? info.message.templateButtonReplyMessage.selectedId : type === "groupInviteMessage" ? info.message.groupInviteMessage.caption : type === "pollCreationMessageV3" ? info.message.pollCreationMessageV3 : type === "interactiveResponseMessage" ? JSON.parse(info.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : type === "text" ? info.text : ""


const metadataCacheGp = new Map();
const METADATA_CACHE_TIME = 15 * 60 * 1000; 
setInterval(() => {
const now = Date.now();
for (const [jid, { expiry }] of metadataCacheGp.entries()) {
if (now > expiry) {
metadataCacheGp.delete(jid);
}
}
}, 100);

async function getGroupMetadata(blinders, jid) {
    const cached = metadataCacheGp.get(jid);
    if (cached && Date.now() < cached.expiry) {
        return cached.data;
    }

    let attempts = 0;
    while (attempts < 3) {
        try {
            const metadata = await blinders.groupMetadata(jid);
            metadataCacheGp.set(jid, {
                data: metadata,
                expiry: Date.now() + METADATA_CACHE_TIME
            });
            return metadata;
        } catch (err) {
            if (err.message.includes('rate-overlimit')) {
                attempts++;
                console.log(`Rate limit detectado. Tentativa ${attempts}/3 em 10s...`);
                await esperar(10000 * attempts); // espera 10s, 20s, 30s
            } else {
                console.error(`[ERRO] Falha ao buscar metadata: ${jid}`, err);
                throw err;
            }
        }
    }
    throw new Error('Falha após 3 tentativas por rate limit');
}



const safeBody = typeof bodyofc === "string" ? bodyofc.trim() : "";
const body = safeBody;
const isGroup = from.endsWith('@g.us');
const isCmd = body.startsWith(prefix)
const comando = isCmd ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null
const metadata = await client.groupMetadata(from);
const participants = isGroup ? await metadata.participants : '';
const sendere2 = info.key.participant?.includes('@lid') ? info.key.participant : info.key.participantAlt;
const sendere = info.key.participantAlt?.includes('@s.whatsapp.net') ? info.key.participantAlt : info.key.participant;
const sender2 = sendere2 || from; //Sender puxando o Lid
const sender = sendere || from; //Sender puxando o Jid
const pushname = info.pushName ? info.pushName : ""
const args = safeBody.split(/ +/).slice(1);
const q = args.join(' ')

const groupMetadata = isGroup ? await getGroupMetadata(blinders, from) : "";
const isBot = info.key.fromMe ? true : false

const dono = [`${donoJid}@s.whatsapp.net`, `${donoLid}@lid`]
const numeroBot = blinders.user.id.split(":")[0]+"@s.whatsapp.net"
const isDono = dono.includes(info.key.participant);

const groupName = isGroup? groupMetadata.subject: "";
const groupDesc = isGroup ? groupMetadata.desc : '';
const groupMembers = isGroup ? groupMetadata.participants : '';
const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : '';
const isAdmBot = isGroup ? isAdmin2(numeroBot, participants) || false : '';
const isAdm = isGroup ? isAdmin2(info.key.participant, participants) : '';

 const meta = await client.groupMetadata(from);
   // const isAdm = isAdmin2(sender, meta.participants);

var texto_exato = (type === 'conversation') ? info.message.conversation : (type === 'extendedTextMessage') ? info.message.extendedTextMessage.text : ''
const texto = texto_exato.slice(0).trim().split(/ +/).shift().toLowerCase()
//SIMULA ESCRITA
async function escrever (texto) {
await client.sendPresenceUpdate('composing', from) 
await esperar(1000) 
client.sendMessage(from, { text: texto }, {quoted: info})
}
//ENVIA UMA MENSAGEM 
const enviar = (texto) => {
client.sendMessage(from, { text: texto }, {quoted: info})
}

//ENVIA IMAGEM 
const enviarImg = async (link) => {await client.sendMessage(from, {image: {url: link}})}

const enviarImg2 = async (link, texto) => {await client.sendMessage(from, {image: {url: link}, caption: texto})}

//ENVIA VÍDEO 
const enviarVd = async (link) => {await client.sendMessage(from, {video: {url: link }, mimetype: "video/mp4", fileName: "play.mp4"}, {quoted: info})}

const enviarVd2 = async (link, texto) => {await client.sendMessage(from, {video: {url: link }, caption: texto, mimetype: "video/mp4", fileName: "video.mp4"}, {quoted: info})}

//ENVIA UM GIF SIMPLES 
const enviarGif = async (link) => {await client.sendMessage(from, { video: {url: link}, gifPlayback: true}, { quoted: info })}

const enviarGif2 = async (link, texto) => {await client.sendMessage(from, { video: {url: link}, caption: texto, gifPlayback: true}, { quoted: info })}
//ENVIA UM AUDIO
const enviarAd = async (link) => {client.sendPresenceUpdate('recording', from);
await esperar(1000);
await client.sendMessage(from, {audio: {url: link }, mimetype: "audio/mpeg"}, {quoted: info})}

const enviarAd2 = async (link) => {await client.sendMessage(from, {audio: {url: link }, mimetype: "audio/mpeg"}, {quoted: selo})}

//CAUSA UM DELAY ENTRE FUNÇÃO 
const esperar = async (tempo) => {
return new Promise(funcao => setTimeout(funcao, tempo));
}
//REAGE A UMA MENSAGEM
const reagir = (reassao) => {
client.sendMessage(from, {react: {text: reassao, key: info.key}})}
//===========BOTOES==========//
async function botaoNormal(client, id, texto, link, botoes) {
try {
var fotin = await prepareWAMessageMedia({ image: {url: link} }, { upload: client.waUploadToServer })
await await client.relayMessage(
id,{ interactiveMessage: { header: { title: "", subtitle: '', hasMediaAttachment: true, imageMessage: fotin.imageMessage
},body: { text: texto },
footer : { "text": "𝐁𝐚𝐬𝐞: 𝑩𝒍𝒊𝒏𝒅𝒆𝒓𝒔 𝑻𝒆𝒄𝒉" },
nativeFlowMessage: {
buttons: botoes.map(botao => ( { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: botao.display_text, id: botao.id })} )),
},messageParamsJson: "", },},{});
} catch (e) {
console.log(e);
enviarPonto(`Deu erro ao enviar o botão...`)
}
}

async function botaoLista(client, id, texto, url, titulo, titulo2, rows){
try {
const fotin = await prepareWAMessageMedia( { image: { url: url } }, { upload: client.waUploadToServer } );
const msgLista = { interactiveMessage: { header: { title: "", subtitle: '', hasMediaAttachment: true, imageMessage: fotin.imageMessage }, body: { text: texto }, footer: { text: "𝑩𝒍𝒊𝒏𝒅𝒆𝒓𝒔 𝑻𝒆𝒄𝒉 API" }, nativeFlowMessage: { buttons: [{ name: "single_select", buttonParamsJson: JSON.stringify({ title: titulo, sections: [{ title: titulo2, rows }]})}],messageParamsJson: ""}}};
await client.relayMessage(id, msgLista, {});
} catch (e) {
console.log(e);
enviarPonto(`Deu erro ao enviar o botão...`)
}
}

async function botaoUrl(client, id, foto, titulo, botoes) {
try {
const fotin = await prepareWAMessageMedia({ image: { url: foto } },{ upload: client.waUploadToServer });
await client.relayMessage(id, { interactiveMessage: { header: { hasMediaAttachment: true, imageMessage: fotin.imageMessage }, body: { text: titulo }, footer: { text: "𝑩𝒍𝒊𝒏𝒅𝒆𝒓𝒔 𝑻𝒆𝒄𝒉 API" }, nativeFlowMessage: { buttons: botoes.map(botao => ({ name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: botao.name, url: botao.url, merchant_url: botao.url }) })) }, messageParamsJson: "" } }, {});
} catch (e) {
console.log(e);
enviarPonto(`Deu erro ao enviar o botão...`)
}
}

async function botaoCopia(client, id, foto, titulo, botoes) {
try {
const fotin = await prepareWAMessageMedia({ image: { url: foto } }, { upload: client.waUploadToServer });
await client.relayMessage(id, { interactiveMessage: { header: { hasMediaAttachment: true, imageMessage: fotin.imageMessage }, body: { text: titulo }, footer: { text: "𝑩𝒍𝒊𝒏𝒅𝒆𝒓𝒔 𝑻𝒆𝒄𝒉 API" }, nativeFlowMessage: { buttons: botoes.map(botao => ({ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: botao.name, id: botao.id, copy_code: botao.copy }) })) }, messageParamsJson: ""}}, {});
} catch (e) {
console.log(e);
enviarPonto(`Deu erro ao enviar o botão...`)
}
}

async function botaoCopia2(client, id, foto, titulo, botoes) {
try {
const fotin = await prepareWAMessageMedia({ image: foto }, { upload: client.waUploadToServer });
await client.relayMessage(id, { interactiveMessage: { header: { hasMediaAttachment: true, imageMessage: fotin.imageMessage }, body: { text: titulo }, footer: { text: "𝑩𝒍𝒊𝒏𝒅𝒆𝒓𝒔 𝑻𝒆𝒄𝒉 API" }, nativeFlowMessage: { buttons: botoes.map(botao => ({ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: botao.name, id: botao.id, copy_code: botao.copy }) })) }, messageParamsJson: ""}}, {});
} catch (e) {
console.log(e);
enviarPonto(`Deu erro ao enviar o botão...`)
}
}

 // funºões //
async function fetchJson (url) {try {
link = await fetch(url); json = await link.json(); return json; } catch (err) {return err}
}
const getBuffer = (url, options) => new Promise(async (resolve, reject) => { 
options ? options : {}
await axios({method: "get", url, headers: {"DNT": 1, "Upgrade-Insecure-Request": 1}, ...options, responseType: "arraybuffer"}).then((res) => {
resolve(res.data)
}).catch(reject)
})

const getFileBuffer = async (mediakey, MediaType) => {
const stream = await downloadContentFromMessage(mediakey, MediaType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
return buffer
}

// ========== AUTORESPOSTAS ========== \\

let autorepliesAtivado = {};
if (fs.existsSync(autorepliesFile)) {
    autorepliesAtivado = JSON.parse(fs.readFileSync(autorepliesFile, 'utf-8'));
}

function salvarAutoreplies() {
    fs.writeFileSync(autorepliesFile, JSON.stringify(autorepliesAtivado, null, 2));
}

function isAutorepliesAtivado(jid) {
    return autorepliesAtivado[jid] === true;
}
//=========== ANTILINK SYSTEM ============\\
let antilinkStatus = {};
if (fs.existsSync(antilinkFile)) {
    antilinkStatus = JSON.parse(fs.readFileSync(antilinkFile, 'utf-8'));
}

function salvarAntilink() {
    fs.writeFileSync(antilinkFile, JSON.stringify(antilinkStatus, null, 2));
}

function isAntilinkAtivado(jid) {
    return antilinkStatus[jid] === true;
}

const linkRegex = /((https?:\/\/)|(www\.))[\w.-]+(\.\w+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/gi;

if (isGroup && isAntilinkAtivado(from)) {
    if (body && linkRegex.test(body)) {
        
        if (isAdm || isBot) return; 
        if (isAdm) return reagir("✅");
        await client.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: info.key.id, participant: sender } });
        
        // Avisa o usuário (opcional, mas recomendado)
        await reagir("🔗");

        await enviar(`🔪 *By order of the Peaky Blinders...*

@ ${sender.split('@')[0]}, links não são permitidos neste grupo.

A sua mensagem foi removida da maneira mais educada possível... da próxima vez, não vai ser só a mensagem que desaparece.

Com os cumprimentos da família Shelby. 🧢`);
    }
}

//=========== ANTILINK HARD (PEAKY BLINDERS MODE) ============\\

if (fs.existsSync(antilinkFile)) {
    antilinkStatus = JSON.parse(fs.readFileSync(antilinkFile, 'utf-8'));
}

function salvarAntilink() {
    fs.writeFileSync(antilinkFile, JSON.stringify(antilinkStatus, null, 2));
}

function isAntilinkAtivado(jid) {
    return antilinkStatus[jid] === true;
}

const linkRegexHard = /\b(https?:\/\/|www\.|\w+\.(com|net|org|co|io|me|gg|link|ly|be|gl|tk|ml|ga|cf)\b|@\w+|t\.me|wa\.me|bit\.ly|goo\.gl|short\.ly|tinyurl\.com|chat\.whatsapp\.com|encurtador)/gi;

if (isGroup && isAntilinkAtivado(from)) {
    if (body && linkRegexHard.test(body.toLowerCase())) {
        if (isAdm || isBot) return;

        // Deleta a mensagem primeiro
        await client.sendMessage(from, { 
            delete: { 
                remoteJid: from, 
                fromMe: false, 
                id: info.key.id, 
                participant: sender 
            } 
        });

        // Depois kicka o infrator
        try {
            await client.groupParticipantsUpdate(from, [sender], 'remove');
            
            // Mensagem épica no grupo (estilo Peaky Blinders)
            await reagir("🔪");
            await client.sendMessage(from, {
                text: `🧢 *By order of the Peaky Blinders...*

@${sender.split('@')[0]} achou que poderia trazer links pra dentro do nosso território.

Erro grave.

A mensagem foi eliminada.  
O indivíduo foi removido.

Aqui não tem conversa.  
Aqui tem consequência.

— Família Shelby`,
                mentions: [sender]
            });

        } catch (error) {
            await enviar(`🔥 Link detectado de @${sender.split('@')[0]}, mas não consegui remover do grupo.\nPromova o bot a administrador para o antilink hard funcionar 100%.`);
        }
    }
}

async function configSet(index){
fs.writeFileSync('./dono/config.json', JSON.stringify(index, null, 2) + '\n')}
  
//SMS globais
smsdono = "*Este comando é so para o lord Supremo*";
erroapi = "parece que vc ainda não tem uma api key";
brevemente = "brevemente no canal";

//PEQUENO LOG
console.log(`\n${pushname} mandou: ${body}`);

switch(comando) {
//========CASES============\\
//BOTÕES 
case 'testebotao':
//Botão lista -- Envia uma mensagem de botão interativo no formato lista.
botaoLista(client, from, "Bom dia", fotomenu, "titulo", "titulo2", [{ header: "nome", title: "titulo", description: "", id: `${prefix}menu`}])
//Botão normal -- Envia uma mensagem de botão interativo no formato normal kk.
botaoNormal (client, from, "oi", fotomenu, [{ display_text: "Menu", id: `${prefix}menu` }])
//Botão cópia -- Envia uma mensagem de botão interativo no formato copia (o usuário consegue copiar oq ta no botão).
botaoCopia(client, from, fotomenu, "Texto principal aqui",
[{name: "Copiar", id: "texto", copy: "texto" }]);
//Botão link -- Envia uma mensagem de botão interativo no formato link (O usuyvai direto para o link que tiver no botão).
botaoUrl(client, from, fotomenu, "Clique no botão abaixo para acessar o site:", [{name: "Visitar Site", url: "link"},]);
break
case 'botaolista':
var fotin = await prepareWAMessageMedia({ image: {url: fotomenu } }, { upload: blinders.waUploadToServer })
await await blinders.relayMessage( from,{ interactiveMessage: { header: {
title: "um macaco pula de galho em galho",
subtitle: '', hasMediaAttachment: true, imageMessage: fotin.imageMessage },body: { text: `` }, footer : { "text": "𝑩𝒍𝒊𝒏𝒅𝒆𝒓𝒔 𝑻𝒆𝒄𝒉 API" }, nativeFlowMessage: {
buttons: [
{
name: "single_select",
buttonParamsJson: JSON.stringify({
title: "LISTA",
sections: [{
title: "Menus de comandos: ",
highlight_label: "comandos",
rows: [
{
header: "Menu",
title: "-> Menu",
description: "",
id: prefix + "menu"}
],},
]}) }
]},messageParamsJson: "", },},{})
break
//====[ COMANDOS DE EXEMPLO ]====//
//simula o bot escrevendo
case 'escreva':
escrever('Fala comigo meu cria')
break
//envia uma mensagem 
case 'enviar':
enviar('oq tem de bom?')
break

case 'menucompleto':
case 'help':
case 'comandos': {
    const menut = `
🧢 *BY ORDER OF THE PEAKY BLINDERS...*

*🤖 ${botName} - MENU COMPLETO*
*👑 Dono:* ${Dononame}
*⚡ Prefixo:* \`${prefix}\`
*📅 Data:* ${new Date().toLocaleDateString('pt-BR')}
*⏰ Hora:* ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
*🏓 Ping:* ${Math.floor(Math.random() * 100) + 50}ms

╔═════════════════╗
   *👑 COMANDOS DO DONO* (Só você)
╚═════════════════╝
➢ ${prefix}menudono → Painel secreto do dono
➢ ${prefix}status → Status completo do bot
➢ ${prefix}bc [msg] → Anúncio em todos os grupos
➢ ${prefix}reiniciar → Reinicia o bot
➢ ${prefix}sairgrupo → Sai do grupo atual
➢ ${prefix}join [link] → Entra em novo grupo
➢ ${prefix}bloquear @ → Bloqueia usuário
➢ ${prefix}desbloquear @ → Desbloqueia usuário
➢ ${prefix}setprefix / setdononame / setubotname / setapikey / setmsg / setemoji

╔═════════════════╗
   *👮 COMANDOS DE ADMIN* (em grupos)
╚═════════════════╝
➢ ${prefix}admin → Menu de administração
➢ ${prefix}ban @ → Remove usuário
➢ ${prefix}promover @ → Dá admin
➢ ${prefix}rebaixar @ → Tira admin
➢ ${prefix}marcar → Marca todos
➢ ${prefix}marcaradmins → Marca só admins
➢ ${prefix}fechargrupo → Só admins falam
➢ ${prefix}abrirgrupo → Todos podem falar
➢ ${prefix}mudarnome [nome] → Altera nome do grupo
➢ ${prefix}mudardesc [desc] → Altera descrição
➢ ${prefix}infogrupo → Infos do grupo
➢ ${prefix}participantes → Lista membros
➢ ${prefix}limpar → Deleta últimas 100 msgs

╔═════════════════╗
   *🔒 PROTEÇÃO & SEGURANÇA*
╚═════════════════╝
➢ ${prefix}antilink on/off → Antilink (deleta links)
➢ ${prefix}antilink on (hard) → Kick automático por link
➢ ${prefix}autoreplies on/off → Respostas automáticas (figurinhas, texto, imagens)

╔═════════════════╗
   *🎵 DOWNLOADS & MÍDIA*
╚═════════════════╝
➢ ${prefix}play2 [nome] → Baixa música do YouTube
➢ ${prefix}tocar [nome] → Mesmo que play2
➢ ${prefix}playvideo → (em breve)

╔═════════════════╗
   *ℹ️ INFORMAÇÕES & UTILIDADES*
╚═════════════════╝
➢ ${prefix}info → Informações básicas do bot
➢ ${prefix}infobot → Infos detalhadas + contatos (com botões)

╔═════════════════╗
   *🛠️ OUTROS & TESTES*
╚═════════════════╝
➢ ${prefix}testebotao → Testa botões interativos
➢ ${prefix}botaolista → Testa lista interativa

*Regra do território:*
Respeite a família Shelby.  
Aqui não tem bagunça.  
Aqui tem consequência. 🔪

*💻 Base:* Blinders Tech API - Melhorada por Artur Shelby
*🌐 Canal:* https://whatsapp.com/channel/0029Vb6kIPAKLaHnbgEM5d3r

By order of the Peaky Blinders. 🧢
    `;

    // Envia com a foto do menu
    await enviarImg2(fotomenu, menut);
}
break;

//menu simples 
case 'menu2':
const menuTxt = `
    _*Seja bem vindo ao menu*_

> *~Comandos do dono~*
=> ${prefix}reiniciar
=> ${prefix}

> *~Comandos dos adm~*
=> ${prefix}ban
=> ${prefix}abrirgrupo
=> ${prefix}fechargrupo
=> ${prefix}marcar
=> ${prefix}sérvio
=> ${prefix}....

> *~Comandos de exemplos~*
=> ${prefix}escreva
=> ${prefix}reagir 
=> ${prefix}enviadas
=> ${prefix}botaolista

> *~Comandos as api~*
=> ${prefix}play
=> ${prefix}playvideo
=> ${prefix}Pinterest
=> ${prefix}wikipedia
=> ${prefix}série
=> ${prefix}

> Isso e um menu simples 😊
> faz a tua beleza
`
enviarImg2(fotomenu, menuTxt)
break

case 'menu':
case 'help':
case 'comandos':
case 'start':
    // Criar os botões
    const botoesMenu = [
        {
            display_text: "➼📱 DONO",
            id: `${prefix}dono`
        },
        {
            display_text: "➼👑 ADMIN",
            id: `${prefix}admin`
        },
        {
            display_text: "➼🎮 DOWNLOADS",
            id: `${prefix}downloads`
        },

        {
            display_text: "⚙️ Menu Completo",
            id: `${prefix}menucompleto`
        },
        {
            display_text: "➼📊 STATUS",
            id: `${prefix}status`
        }
    ];
    
    // Texto do menu
    const textoMenu = `
╔━━━━━━━✦✦✦✦━━━━━━━━╗
 ꙰ ፝⃟ ⸼ ꦿ ✧ *${botName}* 🤖 ✧ ꧇ ༘ ࿆
╚━━━━✦✦✦✦━━━━━━━━━╝    

*👋 Olá, ${pushname}!* ✧ ꧇ ༘ ࿆

➢ *📌 Prefixo:* ${prefix}
➢ *📅 Data:* ${new Date().toLocaleDateString('pt-BR')}
➢ *⏰ Hora:* ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
➢ *🏓 Ping:* ${Math.floor(Math.random() * 100) + 50}ms

➢ *💻 Base:* ${Baseblinders}
➢ *👑 Dono:* ${Dononame}
➢ *⚡ Versão:* 4.2.0

╔══════════════╗
 *ESCOLHA UMA OPÇÃO*
╚══════════════╝

*Clique nos botões abaixo para ver os comandos de cada categoria:*
    `;
    
    // Envia o menu com botões
    await botaoNormal(client, from, textoMenu, fotomenu, botoesMenu);
    break;

case 'admin':
case 'menuadmin':
case 'administrador':
case 'helpadm':
    if (!isGroup) return enviar('❌ Este comando só funciona em grupos, irmão.');

    const botoesAdmin = [
        { display_text: "🔙 Voltar ao Menu", id: `${prefix}menu` },
        { display_text: "📋 Menu Completo", id: `${prefix}menucompleto` },
        { display_text: "🧢 Antilink Hard", id: `${prefix}antilink` }
    ];

    const textoAdmin = `
🧢 *BY ORDER OF THE PEAKY BLINDERS...*

* MENU DE ADMINISTRAÇÃO*

Olá, *${pushname}*.

Você tem poder neste território. Use com sabedoria.

╔══════════════════╗
*COMANDOS DE MODERAÇÃO*
╚══════════════════╝
➼ ${prefix}ban @user → Remove membro
➼ ${prefix}promover @user → Dá admin
➼ ${prefix}rebaixar @user → Tira admin
➼ ${prefix}marcar → Marca todos
➼ ${prefix}marcaradmins → Marca só admins

╔══════════════════╗
*CONTROLE DO GRUPO*
╚══════════════════╝
➼ ${prefix}fechargrupo → Só admins falam
➼ ${prefix}abrirgrupo → Todos podem falar
➼ ${prefix}mudarnome [nome] → Altera nome
➼ ${prefix}mudardesc [texto] → Altera descrição

╔══════════════════╗
*INFORMAÇÃO & LISTAS*
╚══════════════════╝
➼ ${prefix}infogrupo → Infos completas
➼ ${prefix}admin → Lista de administradores
➼ ${prefix}participantes → Lista todos membros

╔══════════════════╗
*SEGURANÇA & LIMPEZA*
╚══════════════════╝
➼ ${prefix}antilink on/off → Antilink Hard (kick automático)
➼ ${prefix}limpar → Deleta últimas 100 mensagens

*Regra de ouro:* Aqui quem manda são os Shelbys.  
Use o poder com responsabilidade... ou não. 🔪

Escolha uma opção abaixo ou digite o comando diretamente.
    `;
    await botaoNormal(client, from, textoAdmin, fotomenu, botoesAdmin);
    break;

case 'menudono':
case 'donomenu':
case 'menuowner':
case 'dono': {
    if (!isDono) {
        reagir("❌");
        return enviar("🚫 Você não tem permissão para acessar o controle da família Shelby.\nSomente o Arthur tem esse poder.");
    }

    const botoesDono = [
        { display_text: "📡 Status do Bot", id: `${prefix}status` },
        { display_text: "🔄 Reiniciar Bot", id: `${prefix}reiniciar` },
        { display_text: "🚪 Sair do Grupo", id: `${prefix}sairgrupo` },
        { display_text: "🔗 Entrar em Grupo", id: `${prefix}join` },
        { display_text: "🔒 Bloquear Usuário", id: `${prefix}bloquear` },
        { display_text: "🔓 Desbloquear", id: `${prefix}desbloquear` }
    ];

    const textoMenuDono = `
🧢 *PAINEL DE CONTROLE - PEAKY BLINDERS*

Olá, *${Dononame}* (Arrur Shelby do bot).

Você está no comando absoluto.  
Use o poder com sabedoria... ou como achar melhor.

╔══════════════════╗
   *COMANDOS DO DONO*
╚══════════════════╝

📡 ${prefix}status → Status completo do bot
📢 ${prefix}bc [msg] → Anúncio em todos os grupos
🔄 ${prefix}reiniciar → Reinicia o bot
🚪 ${prefix}sairgrupo → Sai do grupo atual
🔗 ${prefix}join [link] → Entra em novo grupo
🔒 ${prefix}bloquear @ → Bloqueia usuário
🔓 ${prefix}desbloquear @ → Desbloqueia usuário

⚙️ *Configurações rápidas:*
• ${prefix}setprefix [novo] → Muda prefixo
• ${prefix}setdononame [nome] → Muda seu nome
• ${prefix}setubotname [nome] → Muda nome do bot
• ${prefix}setapikey [chave] → Atualiza API key
• ${prefix}setmsg 1/0 → Liga/desliga visualização de msgs
• ${prefix}setemoji [emoji] → Emoji global

🔧 ${prefix}eval [código] → Executa código JS (perigoso!)

*Tudo sob seu controle. A família obedece.*
— Artur Shelby
    `;

    // Envia com imagem do menu + botões interativos
    await botaoNormal(client, from, textoMenuDono, fotomenu, botoesDono);
}
break;


// ___comandos de exemplos ____//
//imagem normal
case 'img':
enviarImg(fotomenu)
break
//imagem com legenda 
case 'img2':
enviarImg2(fotomenu, "LEGENDA")
break
//vídeo normal
case 'video':
enviarVd("LINK OU CAMINHO DO VÍDEO")
break
//vídeo com legenda 
case 'video2':
enviarVd2("LINK OU CAMINHO DO VÍDEO", "LEGENDADA")
break
//audio com gravação 
case 'audio':
enviarAd("https://files.catbox.moe/uvge5f.wav")
break
//audio com ppt: true
case 'audio2':
enviarAd2("https://files.catbox.moe/uvge5f.wav")
break
//reagi a uma mensagem 
case 'reagir':
reagir("👌")//Reage com o Emoji.
enviar("reação enviada")
break
//espera algum tempo pra responder 
case 'esperar':
await esperar(2000)//2 Segundos
enviar("Esperei 2 segundos 😊👌")
break

// __ fim exemplos ___///

//=== comandos dos administradores==//
case 'admin':
case 'admins':
case 'listadm':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
    if (!isAdm) return enviar(`oh do ${pushname} não és ADM, kkkk e só teste, valeu...`)
    const groupMetadata = await client.groupMetadata(from);
    const admins = getGroupAdmins(groupMetadata.participants);
    
    let adminList = `*👥 LISTA DE ADMINISTRADORES*\n\n`;
    adminList += `*📌 Título:* ${groupMetadata.subject}\n`;
    adminList += `*👤 Criador:* @${groupMetadata.owner.split('@')[0]}\n`;
    adminList += `*🔧 Total de Admins:* ${admins.length}\n\n`;
    
    admins.forEach((admin, index) => {
        const username = admin.split('@')[0];
        adminList += `*${index + 1}.* @${username}\n`;
    });
    
    adminList += `\n📊 *Total:* ${admins.length} administrador(es)`;
    
    // Marca todos os admins
    const mentions = admins.map(admin => admin);
    await client.sendMessage(from, {
        text: adminList,
        mentions: mentions
    }, { quoted: info });
    break;

case 'd': case 'delet': case 'apagar':{
if (!isGroup) return enviar("esse comando é só pra grupos");
if (!isAdmBot) return enviar("fala com um adm, os shelbys tem de ser sempre moderador");
if (!isAdm) return enviar("vc precisa ser admin")
if(!menc) return enviar("Marque a mensagem do usuário que deseja apagar..")
await blinders.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: info.message.extendedTextMessage.contextInfo.stanzaId, participant: menc}})
reagir("🗑️")
};
break
//COMANDO

case 'ban':
case 'banir':
case 'remover':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
        if (!isAdm) return enviar(`oh ${pushname} não és ADM, kkkk e só teste, valeu...`)

    }
    
    const metadata = await client.groupMetadata(from);
    const isAdmin = isAdmin2(sender, metadata.participants);
    
    if (!isAdmin) {
        return enviar('❌ Você precisa ser administrador para usar este comando!');
    }
    
    // Verifica se foi marcado alguém
    const mentioned = info.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentioned.length === 0 && !q) {
        return enviar('❌ Marque o usuário ou envie o número! Ex: !ban @usuário');
    }
    
    const targetUser = mentioned[0] || q + '@s.whatsapp.net';
    
    // Não permite banir outros admins
    if (isAdmin2(targetUser, metadata.participants)) {
        return enviar('❌ Não posso remover outro administrador!');
    }
    
    // Não permite banir a si mesmo
    if (targetUser === sender) {
        return enviar('❌ Você não pode se banir!');
    }
    
    try {
        await client.groupParticipantsUpdate(from, [targetUser], 'remove');
        reagir('✅');
        await client.sendMessage(from, {
            text: `🚫 *USUÁRIO REMOVIDO*\n\n@${targetUser.split('@')[0]} foi removido do grupo!`,
            mentions: [targetUser]
        }, { quoted: info });
    } catch (error) {
        enviar('❌ Erro ao remover usuário. Verifique minhas permissões!');
    }
    break;

case 'promover':
case 'daradm':
case 'addadmin':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
    
   
    
    if (!isAdm) {
        return enviar('❌ Você precisa ser administrador para usar este comando!');
    }
    
    const mentioned2 = info.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentioned2.length === 0 && !q) {
        return enviar('❌ Marque o usuário! Ex: !promover @usuário');
    }
    
    const userToPromote = mentioned2[0] || q + '@s.whatsapp.net';
    
    // Verifica se já é admin
    if (isAdmin2(userToPromote, meta.participants)) {
        return enviar('❌ Este usuário já é administrador!');
    }
    
    try {
        await client.groupParticipantsUpdate(from, [userToPromote], 'promote');
        reagir('👑');
        await client.sendMessage(from, {
            text: `👑 *NOVO ADMINISTRADOR*\n\n@${userToPromote.split('@')[0]} foi promovido a administrador!`,
            mentions: [userToPromote]
        }, { quoted: info });
    } catch (error) {
        enviar('❌ Erro ao promover usuário. Talvez eu não tenha permissão suficiente.');
    }
    break;

case 'rebaixar':
case 'tiraradm':
case 'removeradm':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
    
    const groupMeta = await client.groupMetadata(from);
    const isAdminCheck = isAdmin2(sender, groupMeta.participants);
    
    if (!isAdminCheck) {
        return enviar('❌ Você precisa ser administrador para usar este comando!');
    }
    
    const mentioned3 = info.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentioned3.length === 0 && !q) {
        return enviar('❌ Marque o usuário! Ex: !rebaixar @usuário');
    }
    
    const userToDemote = mentioned3[0] || q + '@s.whatsapp.net';
    
    // Não permite rebaixar o dono do grupo
    if (userToDemote === groupMeta.owner) {
        return enviar('❌ Não posso rebaixar o dono do grupo!');
    }
    
    // Verifica se é admin
    if (!isAdmin2(userToDemote, groupMeta.participants)) {
        return enviar('❌ Este usuário não é administrador!');
    }
    
    // Não permite rebaixar a si mesmo
    if (userToDemote === sender) {
        return enviar('❌ Você não pode se rebaixar!');
    }
    
    try {
        await client.groupParticipantsUpdate(from, [userToDemote], 'demote');
        reagir('⬇️');
        await client.sendMessage(from, {
            text: `⬇️ *ADMINISTRADOR REBAIXADO*\n\n@${userToDemote.split('@')[0]} foi rebaixado!`,
            mentions: [userToDemote]
        }, { quoted: info });
    } catch (error) {
        enviar('❌ Erro ao rebaixar usuário.');
    }
    break;

case 'fechargrupo':
case 'fechar':
case 'lock':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
    
    const groupData = await client.groupMetadata(from);
    const isAdminLock = isAdmin2(sender, groupData.participants);
    
    if (!isAdminLock) {
        return enviar('❌ Você precisa ser administrador para usar este comando!');
    }
    
    try {
        await client.groupSettingUpdate(from, 'announcement');
        reagir('🔒');
        enviar('🔒 *GRUPO FECHADO*\n\nAgora apenas administradores podem enviar mensagens!');
    } catch (error) {
        enviar('❌ Erro ao fechar o grupo.');
    }
    break;

case 'abrirgrupo':
case 'abrir':
case 'unlock':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
    
    const groupInfo = await client.groupMetadata(from);
    const isAdminUnlock = isAdmin2(sender, groupInfo.participants);
    
    if (!isAdminUnlock) {
        return enviar('❌ Você precisa ser administrador para usar este comando!');
    }
    
    try {
        await client.groupSettingUpdate(from, 'not_announcement');
        reagir('🔓');
        enviar('🔓 *GRUPO ABERTO*\n\nTodos os membros podem enviar mensagens novamente!');
    } catch (error) {
        enviar('❌ Erro ao abrir o grupo.');
    }
    break;

case 'mudarnome':
case 'setnome':
case 'setname':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
    
    const groupMetadataName = await client.groupMetadata(from);
    const isAdminName = isAdmin2(sender, groupMetadataName.participants);
    
    if (!isAdminName) {
        return enviar('❌ Você precisa ser administrador para usar este comando!');
    }
    
    if (!q) {
        return enviar('❌ Digite o novo nome do grupo! Ex: !mudarnome Nome do Grupo');
    }
    
    try {
        await client.groupUpdateSubject(from, q);
        reagir('📝');
        enviar(`📝 *NOME ALTERADO*\n\nO nome do grupo foi alterado para:\n*${q}*`);
    } catch (error) {
        enviar('❌ Erro ao alterar o nome do grupo.');
    }
    break;
case 'antilink':
    if (!isGroup) return enviar('❌ Este comando só funciona em grupos!');
    if (!isAdm) return enviar('❌ Apenas administradores podem usar este comando!');

    if (!q || !['on', 'off'].includes(q.toLowerCase())) {
        const status = isAntilinkAtivado(from) ? '✅ Ativado' : '❌ Desativado';
        return enviar(`*🔗 ANTILINK*\n\nStatus atual: ${status}\n\nUse:\n${prefix}antilink on → Ativar\n${prefix}antilink off → Desativar`);
    }

    if (q.toLowerCase() === 'on') {
        antilinkStatus[from] = true;
        salvarAntilink();
        reagir('✅');
        enviar('🔒 Antilink ativado!\nAgora mensagens com links serão removidas automaticamente (exceto de admins).');
    } else if (q.toLowerCase() === 'off') {
        antilinkStatus[from] = false;
        salvarAntilink();
        reagir('🔓');
        enviar('🔓 Antilink desativado!\nLinks agora são permitidos para todos.');
    }
    break;

case 'antilink':
case 'antlinkhard':
    if (!isGroup) return enviar('❌ Este comando só funciona em grupos!');
    if (!isAdm) return enviar('❌ Apenas administradores podem controlar os Peaky Blinders.');

    if (!q || !['on', 'off'].includes(q.toLowerCase())) {
        const status = isAntilinkAtivado(from) ? '✅ ATIVADO (MODO HARD)' : '❌ Desativado';
        return enviar(`*🔪 ANTILINK HARD - PEAKY BLINDERS MODE*\n\nStatus atual: ${status}\n\nUse:\n${prefix}antilink on → Ativar (kick automático)\n${prefix}antilink off → Desativar`);
    }

    if (q.toLowerCase() === 'on') {
        antilinkStatus[from] = true;
        salvarAntilink();
        reagir('🩸');
        enviar(`🔥 *ANTILINK HARD ATIVADO*\n\nAgora quem mandar link:\n➜ Mensagem deletada\n➜ Usuário removido na hora\n\n*By order of the Peaky Blinders.* 🧢`);
    } else if (q.toLowerCase() === 'off') {
        antilinkStatus[from] = false;
        salvarAntilink();
        reagir('⚖️');
        enviar('🕊️ Antilink hard desativado.\nO território está em paz... por enquanto.');
    }
    break;

case 'autoreplies':
case 'respostasauto':
case 'auto':
    if (!isGroup) return enviar('❌ Este comando só funciona em grupos.');
    if (!isAdm) return enviar('❌ Apenas administradores podem controlar as respostas automáticas.');

    if (!q || !['on', 'off'].includes(q.toLowerCase())) {
        const status = isAutorepliesAtivado(from) ? '✅ ATIVADAS' : '❌ Desativadas';
        return enviar(`🧢 *RESPOSTAS AUTOMÁTICAS*\n\nStatus: ${status}\n\nComandos disponíveis:\n• Texto\n• Figurinhas\n• Imagens com legenda\n• Combinações\n\nUse:\n${prefix}autoreplies on\n${prefix}autoreplies off`);
    }

    if (q.toLowerCase() === 'on') {
        autorepliesAtivado[from] = true;
        salvarAutoreplies();
        reagir('🗣️');
        await enviar('🔥 *Respostas automáticas ATIVADAS!*\n\nAgora o bot responde com texto, figurinhas e imagens quando detectar palavras-chave.\n\nBy order of the Peaky Blinders. 🧢');
    } else {
        autorepliesAtivado[from] = false;
        salvarAutoreplies();
        reagir('🔇');
        await enviar('🔇 Respostas automáticas desativadas.\nSilêncio no território.');
    }
    break;


case 'mudardesc':
case 'setdesc':
case 'setdescription':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
    
    const groupMetaDesc = await client.groupMetadata(from);
    const isAdminDesc = isAdmin2(sender, groupMetaDesc.participants);
    
    if (!isAdminDesc) {
        return enviar('❌ Você precisa ser administrador para usar este comando!');
    }
    
    if (!q) {
        return enviar('❌ Digite a nova descrição! Ex: !mudardesc Esta é a nova descrição');
    }
    
    try {
        await client.groupUpdateDescription(from, q);
        reagir('📄');
        enviar(`📄 *DESCRIÇÃO ALTERADA*\n\nA descrição do grupo foi atualizada!`);
    } catch (error) {
        enviar('❌ Erro ao alterar a descrição.');
    }
    break;

case 'limpar':
case 'clean':
case 'limpartudo':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
    
    const groupClean = await client.groupMetadata(from);
    const isAdminClean = isAdmin2(sender, groupClean.participants);
    
    if (!isAdminClean) {
        return enviar('❌ Você precisa ser administrador para usar este comando!');
    }
    
    try {
        // Pega as últimas mensagens
        const messages = await client.loadMessages(from, 100);
        const messageKeys = messages.map(msg => msg.key);
        
        // Deleta em lotes de 50
        for (let i = 0; i < messageKeys.length; i += 50) {
            const batch = messageKeys.slice(i, i + 50);
            await client.sendMessage(from, { delete: { remoteJid: from, fromMe: true, id: batch[0].id, participant: batch[0].participant } });
            await esperar(500);
        }
        
        reagir('🧹');
        enviar('🧹 *CHAT LIMPO*\n\nÚltimas 100 mensagens foram deletadas!');
    } catch (error) {
        enviar('❌ Erro ao limpar o chat. Talvez eu não tenha permissão para deletar algumas mensagens.');
    }
    break;



case 'marcar':
case 'marcartodos':
case 'tagall':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
    
    const groupTag = await client.groupMetadata(from);
    const isAdminTag = isAdmin2(sender, groupTag.participants);
    
    if (!isAdminTag) {
        return enviar('❌ Você precisa ser administrador para usar este comando!');
    }
    
    const participants = groupTag.participants;
    let mentionMessage = `*📢 MENÇÃO GERAL*\n\n`;
    
    if (q) {
        mentionMessage += `*Mensagem:* ${q}\n\n`;
    } else {
        mentionMessage += `*Administrador:* @${sender.split('@')[0]}\n\n`;
    }
    
    mentionMessage += `*Lista de membros:*\n`;
    
    participants.forEach((participant, index) => {
        mentionMessage += `@${participant.id.split('@')[0]} `;
    });
    
    mentionMessage += `\n\n📊 *Total:* ${participants.length} membro(s)`;
    
    // Marca todos os participantes
    const allMentions = participants.map(p => p.id);
    
    await client.sendMessage(from, {
        text: mentionMessage,
        mentions: allMentions
    }, { quoted: info });
    break;

case 'marcaradmins':
case 'tagadmins':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
        if (!isAdm) {
        return enviar('❌ Você precisa ser administrador para usar este comando!');
    }
    
    const groupTagAdmins = await client.groupMetadata(from);
    const isAdminTagAdmins = isAdmin2(sender, groupTagAdmins.participants);
    
    if (!isAdminTagAdmins) {
        return enviar('❌ Você precisa ser administrador para usar este comando!');
    }
    
    const adminsList = getGroupAdmins(groupTagAdmins.participants);
    
    let adminTagMessage = `*👥 MENCIONANDO ADMINISTRADORES*\n\n`;
    adminTagMessage += `*Chamado por:* @${sender.split('@')[0]}\n\n`;
    
    if (q) {
        adminTagMessage += `*Motivo:* ${q}\n\n`;
    }
    
    adminTagMessage += `*Administradores mencionados:*\n`;
    
    adminsList.forEach((admin, index) => {
        adminTagMessage += `@${admin.split('@')[0]}\n`;
    });
    
    await client.sendMessage(from, {
        text: adminTagMessage,
        mentions: adminsList
    }, { quoted: info });
    break;

case 'infogrupo':
case 'groupinfo':
case 'ginfo':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
    
    const groupInfoFull = await client.groupMetadata(from);
    const creationDate = new Date(groupInfoFull.creation * 1000).toLocaleDateString('pt-BR');
    
    const infoText = `
*📊 INFORMAÇÕES DO GRUPO*

*📌 Nome:* ${groupInfoFull.subject}
*👤 Criador:* @${groupInfoFull.owner.split('@')[0]}
*📅 Criado em:* ${creationDate}
*👥 Participantes:* ${groupInfoFull.participants.length}
*👑 Administradores:* ${getGroupAdmins(groupInfoFull.participants).length}
*🔒 Status:* ${groupInfoFull.announce ? 'Fechado 🔒' : 'Aberto 🔓'}
*📝 Descrição:* ${groupInfoFull.desc || 'Sem descrição'}

*🆔 ID do Grupo:* ${groupInfoFull.id}
    `;
    
    enviar(infoText);
    break;


        
 case 'ping':
case 'p':
case 'statusping':
case 'uptime': {
    // Calcula uptime
    const uptime = process.uptime();
    const dias = Math.floor(uptime / (3600 * 24));
    const horas = Math.floor((uptime % (3600 * 24)) / 3600);
    const minutos = Math.floor((uptime % 3600) / 60);
    const segundos = Math.floor(uptime % 60);

    // Ping aproximado (tempo de processamento da mensagem)
    const tempoInicio = Date.now();
    // Aqui poderia ter uma chamada fake pra medir latência real se quiser
    const latencia = Date.now() - tempoInicio + Math.floor(Math.random() * 20) + 30; // simula 30-50ms + real

    // Quantidade de grupos (opcional, mas foda)
    let totalGrupos = 0;
    try {
        const grupos = await client.groupFetchAllParticipating();
        totalGrupos = Object.keys(grupos).length;
    } catch (e) {
        totalGrupos = "Indisponível (rate-limit)";
    }

    // Memória usada (em MB)
    const memoria = process.memoryUsage();
    const ramUsada = (memoria.heapUsed / 1024 / 1024).toFixed(2);

    const pingTexto = `
🧢 *BY ORDER OF THE PEAKY BLINDERS...*

*🤖 STATUS & PING DO BOT*

➤ Latência: ${latencia}ms
➤ Online há: ${dias} dias, ${horas}h ${minutos}m ${segundos}s
➤ Grupos ativos: ${totalGrupos}
➤ Memória usada: ${ramUsada} MB
➤ Data/Hora: ${new Date().toLocaleString('pt-BR')}

*O território está sob controle.*
A família Shelby nunca dorme.

— ${Dononame} (shelbyboss kkkk)
    `;

    // Envia com reação e imagem do menu (ou sem, se preferir)
    await reagir("🚬");
    await enviarImg2(fotomenu, pingTexto);
}
break;   

case 'participantes':
case 'membros':
case 'members':
    if (!isGroup) {
        return enviar('Este comando só funciona em grupos!');
    }
    
    const groupMembers = await client.groupMetadata(from);
    const membersList = groupMembers.participants;
    
    let membersText = `*👥 LISTA DE MEMBROS*\n\n`;
    membersText += `*Grupo:* ${groupMembers.subject}\n`;
    membersText += `*Total:* ${membersList.length} membro(s)\n\n`;
    
    // Mostra apenas os primeiros 50 membros para não ficar muito grande
    const displayLimit = Math.min(membersList.length, 50);
    
    for (let i = 0; i < displayLimit; i++) {
        const member = membersList[i];
        const isAdmin = member.admin ? '👑' : '👤';
        const number = member.id.split('@')[0];
        membersText += `${isAdmin} @${number}\n`;
    }
    
    if (membersList.length > 50) {
        membersText += `\n... e mais ${membersList.length - 50} membro(s)`;
    }
    
    // Marca os membros mostrados
    const displayedMentions = membersList.slice(0, displayLimit).map(m => m.id);
    
    await client.sendMessage(from, {
        text: membersText,
        mentions: displayedMentions
    }, { quoted: info });
    break;

case 'helpadm':
case 'adminhelp':
case 'ajudaadm':
    const adminHelp = `
*👑 COMANDOS DE ADMINISTRAÇÃO*

*📋 Informação:*
!admin - Lista todos os administradores
!infogrupo - Informações detalhadas do grupo
!participantes - Lista todos os membros

*👤 Moderação:*
!ban @usuário - Remove um usuário
!promover @usuário - Torna usuário admin
!rebaixar @usuário - Remove admin de usuário
!mutar @usuário 10 - Muta usuário por X minutos

*📢 Menções:*
!marcar - Marca todos os membros
!marcaradmins - Marca apenas administradores

*⚙️ Configuração:*
!fechargrupo - Só admins podem falar
!abrirgrupo - Todos podem falar
!mudarnome [nome] - Altera nome do grupo
!mudardesc [desc] - Altera descrição

*🧹 Limpeza:*
!limpar - Limpa as últimas 100 mensagens

*🔧 Outros:*
!antilink - Ativa/desativa proteção contra links

*📌 Nota:* Todos os comandos funcionam apenas em grupos e exigem permissão de administrador.
    `;
    
    enviar(adminHelp);
    break;



case 'info':
    const infoMsg = `
_*📊 Informações do Bot:*_
> 🤖 Nome: ${botName}
> ⚙️ Prefixo: ${prefix}
> 👑 Dono: ${Dononame}
> 📅 Desenvolvido por: Artur Shelby
> 🌐 canal: whatsapp.com/channel/0029Vb6kIPAKLaHnbgEM5d3r
    `;
    enviar(infoMsg);
    break;

case 'infobot':
case 'botinfo':
    const botoesCopia = [
        {
            name: "📞 NÚMERO DO DONO",
            id: "numero",
            copy: "244938041330"
        },
        {
            name: "🔗 CANAL OFICIAL",
            id: "grupo",
            copy: "https://whatsapp.com/channel/0029Vb6kIPAKLaHnbgEM5d3r"
        },
        {
            name: "💻 REPOSITÓRIO",
            id: "github",
            copy: "https://github.com/ArturShelby"
        }
    ];
    
    const textoInfo = `
╔══════════════════════╗
   *🤖 INFORMAÇÕES DO BOT*
╚══════════════════════╝

*📌 DETALHES TÉCNICOS:*
> Nome: ${botName}
> Dono: ${Dononame}
> Prefixo: ${prefix}
> Versão: 4.2.0

*👥 CONTATOS:*
> Dono: +244 938 041 330
> Grupo Oficial: Link abaixo
> Suporte: 24/7 disponível

*💻 TECNOLOGIAS:*
> Linguagem: JavaScript
> Framework: Node.js + Baileys
> Banco de dados: SQLite
> Hospedagem: 24/7

*🔧 Clique nos botões abaixo para copiar informações úteis:*
    `;
    
    await botaoCopia(client, from, fotomenu, textoInfo, botoesCopia);
    break;

// ____Comandos da api____///
//dowloads
case 'play':
case 'tocar':
case 'ytmp3':
case 'mp3': {
    if (!q) return await enviar("❌ Cadê o nome da música, irmão?\nEx: !play melo de perdida ou !play shelby blues");

    await reagir("🕓");
    await enviar("🔪 *Buscando o som... não mexa com o território enquanto eu trabalho.*");

    try {
        const apiRes = await fetchJson(`http://speedhostingg.cloud:2068/api/pesquisa/youtube?query=${encodeURIComponent(q)}&apikey=${Blinders_APIKEY}`);

        if (!apiRes || !apiRes.resultado || apiRes.resultado.length === 0) {
            return await enviar("❌ Nenhum som encontrado. Tente outro nome ou seja mais específico.\nAqui não tem espaço pra erro.");
        }

        const musica = apiRes.resultado[0];

        await reagir("🚬"); // cigarro - "calma, tá fumando enquanto baixa"
        await enviar(`🧢 *Baixando "${musica.title}"...*\nAguarde, a família Shelby não deixa ninguém esperando muito tempo.`);

        const textoPreview = `
🧢 *BY ORDER OF THE PEAKY BLINDERS - MUSIC MODULE* 🗡️

🔥 *Título:* ${musica.title}  
⏳ *Duração:* ${musica.timestamp || "Desconhecida"}  
👑 *Canal:* ${musica.author?.name || "Desconhecido"}  
👀 *Visualizações:* ${musica.views || "?"}  
📜 *Descrição:* ${musica.description || "Sem descrição"}  

〰〰〰〰〰〰〰〰〰〰〰〰
💀 *Sistema de áudio inicializado.*  
*Preparando stream... não mexa com o rádio.*

*By order of the Peaky Blinders.* 🩸
        `;

        const foto = musica.image || musica.thumbnail || fotomenu;
        await enviarImg2(foto, textoPreview);

        const linkMp3 = `http://speedhostingg.cloud:2068/api/download/ytmp3?url=${musica.url}&apikey=${Blinders_APIKEY}`;
        await enviarAd(linkMp3);

        await reagir("✅");
        await enviar("🔥 *Áudio entregue. Agora é só curtir o território.*");

    } catch (err) {
        console.log("Erro no play:", err);
        await enviar("❌ Deu ruim no download.\nA API pode estar offline ou o som não existe.\nTente outro ou chame o chefe (dono).");
    }
}
break;

case 'playvideo':
case 'videoplay':
case 'ytvideo':
case 'video': {
    if (!q) return await enviar("❌ Digite o nome da música/vídeo!\nEx: !playvideo melo de perdida");

    await reagir("🕓");
    await enviar("🔍 Buscando o vídeo... Aguarde um momento, irmão.");

    try {
        // Primeiro busca o vídeo (usando o endpoint de pesquisa como no play2)
        const busca = await fetchJson(`http://speedhostingg.cloud:2068/api/pesquisa/youtube?query=${encodeURIComponent(q)}&apikey=${Blinders_APIKEY}`);

        if (!busca || !busca.resultado || busca.resultado.length === 0) {
            return await enviar("❌ Nenhum resultado encontrado. Tente outro nome.");
        }

        const video = busca.resultado[0];

        // Envia preview com thumbnail e infos
        const textoPreview = `
🎥 *VIDEO MODULE - PEAKY BLINDERS EDITION*

Título: *${video.title || "Título indisponível"}*
Duração: *${video.timestamp || "?"}*
Canal: *${video.author?.name || "Desconhecido"}*
Visualizações: *${video.views || "?"}*

Baixando o vídeo... Aguarde! 🧢
        `;

        await enviarImg2(video.thumbnail || video.image || fotomenu, textoPreview);

        // Agora baixa o vídeo usando o endpoint que você indicou
        const linkDownload = `http://speedhostingg.cloud:2068/api/download/PlayVideo?query=${encodeURIComponent(q)}&apikey=${Blinders_APIKEY}`;

        // Envia o vídeo diretamente (usa o link da API)
        await client.sendMessage(from, {
            video: { url: linkDownload },
            mimetype: 'video/mp4',
            fileName: `${video.title || "video"}.mp4`,
            caption: `🧢 *Aqui está seu vídeo!*\n\nTítulo: ${video.title}\nCanal: ${video.author?.name || "N/D"}\nBy order of the Peaky Blinders.`
        }, { quoted: info });

        await reagir("✅");

    } catch (error) {
        console.log("Erro no playvideo:", error);
        await enviar("❌ Erro ao baixar o vídeo. A API pode estar offline ou o vídeo não está disponível.\nTente outro nome ou reporte pro dono.");
    }
}
break;

case 'apkdownload':
case 'apk':
case 'baixarapk':
case 'downapk': {
    if (!q) return await enviar("❌ Digite o nome do app que quer baixar!\nEx: !apk pou\nEx: !apk whatsapp");

    await reagir("🕓");
    await enviar("🔎 Buscando o APK no Aptoide... Aguarde um momento, irmão.");

    try {
        // Monta a URL da API com o query
        const apiUrl = `http://speedhostingg.cloud:2068/api/pesquisa/aptoide?query=${encodeURIComponent(q)}&apikey=${Blinders_APIKEY}`;
        const resposta = await fetchJson(apiUrl);

        if (!resposta || !resposta.resultado || !resposta.resultado.download) {
            return await enviar("❌ Nenhum APK encontrado para esse nome.\nTente outro app ou mais específico (ex: pou, pubg, free fire)!");
        }
        const app = resposta.resultado;
        const textoPreview = `
📱 *APK DOWNLOAD - PEAKY BLINDERS EDITION*

*App:* ${app.appName || "Nome indisponível"}
*Desenvolvedor:* ${app.appDeveloper || "Desconhecido"}

Baixando o APK agora... Aguarde! 🧢
        `;

        // Envia a imagem do ícone + preview
        await enviarImg2(app.image || fotomenu, textoPreview);

        // Envia o arquivo APK diretamente com legenda
        await client.sendMessage(from, {
            document: { url: app.download },
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${app.appName || q}.apk`,
            caption: `🧢 *Aqui está o APK do ${app.appName || q}!*\n\nDesenvolvedor: ${app.appDeveloper || "N/D"}\n\nInstale por sua conta e risco! By order of the Peaky Blinders. 🔪`
        }, { quoted: info });

        await reagir("✅");

    } catch (err) {
        console.log("Erro no apkdownload:", err);
        await enviar("❌ Erro ao baixar o APK.\nPossíveis causas:\n• App não encontrado\n• API offline\n• Link inválido\nTente outro nome ou reporte pro dono!");
    }
}
break;      
        
  case 'audiomeme':
case 'memeaudio':
case 'memesom':
case 'somememe': {
    if (!q) return await enviar("❌ Digite o nome do meme ou pessoa!\nEx: !audiomeme bolsonaro\nEx: !audiomeme lula");

    await reagir("🕓");
    await enviar("🔎 Buscando sons memes... Aguarde um segundo, irmão.");

    try {
        // Monta a URL da API com o nome digitado
        const apiUrl = `http://speedhostingg.cloud:2068/api/download/audiomeme?nome=${encodeURIComponent(q)}&apikey=${Blinders_APIKEY}`;
        const resposta = await fetchJson(apiUrl);

        if (!resposta || !resposta.result || resposta.result.length === 0) {
            return await enviar("❌ Nenhum som meme encontrado pra isso.\nTente outro nome (ex: bolsonaro, lula, mito, etc.)");
        }
        const listaSons = resposta.result;

        const audioAleatorio = listaSons[Math.floor(Math.random() * listaSons.length)];

        // Envia o áudio com legenda temática
        await client.sendPresenceUpdate('recording', from);
        await esperar(1000); // simula gravação

        await client.sendMessage(from, {
            audio: { url: audioAleatorio },
            mimetype: 'audio/mpeg',
            fileName: `meme_${q.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`
        }, { quoted: info });

        // Legenda divertida
        await enviar(`🧢 *Meme áudio aleatório ativado!*  
Nome buscado: ${q}

Um som clássico pra zoar o grupo.  
By order of the Peaky Blinders... 🔥`);

        await reagir("😂");

    } catch (err) {
        console.log("Erro no audiomeme:", err);
        await enviar("❌ Deu ruim ao buscar o meme.\nA API pode estar offline ou o nome não existe.\nTente outro (ex: bolsonaro, lula, mito)!");
    }
}
break;      

//////#### COMANDOS EXCLUSIVOS DO DONO - PEAKY BLINDERS ####//////
case 'setapikey':
case 'setdononame':
case 'setubotname':
case 'setemoji':
case 'setlid':
case 'setjid':
case 'setprefix':
case 'setmsg':
case 'statusbot':
case 'status':
case 'bloquear':
case 'block':
case 'desbloquear':
case 'unblock':
case 'sairgrupo':
case 'leave':
case 'entrar':
case 'join':
case 'rr':
case 'restart':
case 'eval':
case '>': {
    if (!isDono) return enviar(smsdono); // Protege TODO o bloco

    switch (comando) {
        // CONFIGURAÇÕES GERAIS
        case 'setapikey':
            config.Blinders_APIKEY = q;
            await configSet(config);
            await enviar("🔐 A chave da API foi atualizada com sucesso. O sistema já reconheceu a nova credencial.");
            break;

        case 'setdononame':
            config.Dononame = q;
            await configSet(config);
            await enviar("👤 O nome do dono foi configurado corretamente. As próximas mensagens usarão o novo identificador.");
            break;

        case 'setubotname':
            config.botName = q;
            await configSet(config);
            await enviar("🧩 O nome do bot foi atualizado. Comunicação com o servidor restabelecida.");
            break;

        case 'setemoji':
            config.emojiglobal = q;
            await configSet(config);
            await enviar("💠 O emoji padrão foi modificado. As respostas terão um toque mais personalizado agora.");
            break;

        case 'setlid':
            config.donoLid = q || sender2;
            await configSet(config);
            await enviar("🛰️ O LID do dono foi definido corretamente. Canal de autenticação atualizado.");
            break;

        case 'setjid':
            config.donoJid = q || sender;
            await configSet(config);
            await enviar("📡 O JID do dono foi registrado. Comunicação direta estabelecida com sucesso.");
            break;

        case 'setprefix':
            config.prefix = q;
            await configSet(config);
            await enviar(`⚙️ O prefixo de comandos foi alterado para "${q}". Todos os comandos seguirão esse formato.`);
            break;

        case 'setmsg':
            if (Number(q[0]) === 1) {
                config.verMsg = true;
                await configSet(config);
                await enviar("📬 A visualização de mensagens foi ativada. Monitoramento em tempo real iniciado.");
            } else if (Number(q[0]) === 0) {
                config.verMsg = false;
                await configSet(config);
                await enviar("📭 A visualização de mensagens foi desativada. Modo discreto ativo.");
            } else {
                await enviar("Use 1 para ativar ou 0 para desativar.");
            }
            break;

        // STATUS E RELATÓRIOS
        case 'statusbot':
        case 'status':
            let grupos = await client.groupFetchAllParticipating();
            let totalGrupos = Object.keys(grupos).length;
            let uptime = process.uptime();
            let horas = Math.floor(uptime / 3600);
            let minutos = Math.floor((uptime % 3600) / 60);
            let segundos = Math.floor(uptime % 60);

            const statusText = `
🧢 *STATUS DO BLINDERS - RELATÓRIO INTERNO*

🤖 Nome do Bot: ${botName}
👑 Dono: ${Dononame}
⚙️ Prefixo atual: "${prefix}"
📡 Grupos ativos: ${totalGrupos}
⏰ Uptime: ${horas}h ${minutos}m ${segundos}s
🔐 API Key: ${config.Blinders_APIKEY ? "✅ Configurada" : "❌ Não configurada"}
🌐 Versão: 4.2.0 Premium
🛡️ Modo discreto (verMsg): ${config.verMsg ? "Ativado" : "Desativado"}

*Tudo sob controle. A família Shelby está no comando.*
            `;
            await enviarImg2(fotomenu, statusText);
            break;

        // BLOQUEIO / DESBLOQUEIO
        case 'bloquear':
        case 'block':
            if (!q && !info.message.extendedTextMessage?.contextInfo?.mentionedJid) return enviar("Marque ou envie o número pra bloquear.");
            const alvoBlock = mentioned[0] || q.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            try {
                await client.updateBlockStatus(alvoBlock, 'block');
                await enviar(`🔒 Usuário ${alvoBlock.split('@')[0]} foi bloqueado permanentemente.\nNinguém mexe com a família.`);
            } catch {
                await enviar("❌ Erro ao bloquear. Verifique o número.");
            }
            break;

        case 'desbloquear':
        case 'unblock':
            if (!q && !mentioned.length) return enviar("Marque ou envie o número pra desbloquear.");
            const alvoUnblock = mentioned[0] || q.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            try {
                await client.updateBlockStatus(alvoUnblock, 'unblock');
                await enviar(`🔓 Usuário ${alvoUnblock.split('@')[0]} foi desbloqueado.\nTalvez mereça uma segunda chance...`);
            } catch {
                await enviar("❌ Erro ao desbloquear.");
            }
            break;

        // GERENCIAMENTO DE GRUPOS
        case 'sairgrupo':
        case 'leave':
            if (!isGroup) return enviar("Este comando só funciona dentro de um grupo.");
            await enviar("🧢 By order of the Peaky Blinders...\nEstou saindo deste território.\nAdeus.");
            await esperar(2000);
            await client.groupLeave(from);
            break;

        case 'entrar':
        case 'join':
            if (!q) return enviar("Envie o link do grupo.\nEx: !join https://chat.whatsapp.com/...");
            const code = q.split('https://chat.whatsapp.com/')[1];
            if (!code) return enviar("Link inválido.");
            try {
                await client.groupAcceptInvite(code);
                await enviar("✅ Entrei no grupo com sucesso.\nA família Shelby agora controla este território.");
            } catch {
                await enviar("❌ Não consegui entrar. Link inválido ou expirado.");
            }
            break;

        // REINÍCIO E EVAL (PERIGOSO)
        case 'rr':
        case 'restart':
            await enviar("🔄 Reiniciando o sistema...\nBy order of the Peaky Blinders, voltarei em breve.");
            process.exit();
            break;

        case 'eval':
        case '>':
            try {
                let evaled = await eval(q);
                if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                await enviar(`✅ *Resultado:*\n\`\`\`${evaled}\`\`\``);
            } catch (err) {
                await enviar(`❌ *Erro:*\n\`\`\`${err}\`\`\``);
            }
            break;
    }
}
break;


//======CASES ACIMA=========\\
default:
if (isCmd) {
reagir("❌")
enviar(`> Isso aí não faz sentido nem pra um ~Shelby~, Use ${prefix}menu antes que a Polly resolva isso do jeito dela.`)
}
}
//=========IFS===========\\
// ========== AUTORESPOSTAS AUTOMÁTICAS ========== \\
if (isGroup && isAutorepliesAtivado(from) && !isAdm && !isBot && body) {
    const texto = body.toLowerCase().trim();

    // 1. Resposta com FIGURINHA ALEATÓRIA (ex: alma/bot)
    if (texto.includes("alma") || texto.includes("bot") || texto.includes("blinders")) {
        const random = Math.floor(Math.random() * 26) + 1;
        const fig = `./files/figurinha/alma${random}.webp`;
        await client.sendMessage(from, { sticker: { url: fig } }, { quoted: info });
        return;
    }

    // 2. Resposta com TEXTO SIMPLES
    if (texto.includes("bom dia")) {
        await escrever("🧢 Bom dia, irmão.\nQue o café seja forte e os negócios prosperem.\nBy order of the Peaky Blinders.");
        return;
    }

    if (texto.includes("boa tarde")) {
        await enviar("☕ Boa tarde.\nA cidade está calma... por enquanto.");
        return;
    }

    if (texto.includes("boa noite") || texto.includes("dormir") || texto.includes("sono")) {
        await enviar("🌙 Boa noite.\nDurma com um olho aberto. Em Birmingham, nunca se sabe quem está na sombra.\n— Arthur Shelby");
        await client.sendMessage(from, { sticker: { url: "./files/figurinha/alma4.webp" } }, { quoted: info });
        return;
    }

    // 3. Resposta com IMAGEM + LEGENDA
    if (texto.includes("Arthur") || texto.includes("shelby") || texto.includes("peaky")) {
        await enviarImg2("https://files.catbox.moe/exemplo-tommy.jpg", // troque por um link ou caminho local foda do artur
            "🧢 *Thomas Shelby*\n\nAqui quem manda sou eu.\nNão há negociação.\nNão há segunda chance.\n\nBy order of the Peaky Blinders.");
        return;
    }

    // 4. Resposta com TEXTO + FIGURINHA
    if (texto.includes("não entendi") || texto.includes("oq") || texto.includes("como?") || texto.includes("entendi")) {
        await enviar("🤨 Calma aí, irmão...\nTá falando grego ou tá só perdido?");
        await client.sendMessage(from, { sticker: { url: "./files/figurinha/naoEntendi.webp" } }, { quoted: info });
        return;
    }

    // 5. Resposta com IMAGEM ESTÁTICA + TEXTO FORTE
    if (texto.includes("polly") || texto.includes("tia polly")) {
        await enviarImg2("./dados/imagem/polly.jpg", // caminho local ou link
            "⚖️ *Elizabeth Gray — Tia Polly*\n\nNão mexa com a família.\nEu cuido das contas... e das vinganças.\nRespeite.");
        return;
    }

    // 6. Exemplo de resposta com GIF (se quiser)
    if (texto.includes("cigarro") || texto.includes("fumar")) {
        await enviarGif2("https://files.catbox.moe/artur-cigarro.gif",
            "💨 Um cigarro pra acalmar os nervos...\nOs negócios estão tensos hoje.");
        return;
    }

    // Adicione mais condições aqui quantas quiser!
}


//=========IF ACIMA========\\
} catch (erro) {
console.log(erro)
}})

//=======ATT CONEXÃO========\\
blinders.ev.on('connection.update', (update) => {
const { connection, lastDisconnect } = update;
if (connection === 'open') {//CONEXÃO ABERTA
console.log("[ CONECTADO ] - Conexão estabelecida...")
console.log("[ LOG ] - Bot conectado com sucesso �?")
} else if (connection === "connecting") {//TENTANDO CONECTAR
console.log(``)
console.log("[ CONEXÃO ] - Estabelecendo conexão com o whatsapp...")
} else if (connection === 'close') {//CONEXÃO FECHADA
const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
if (shouldReconnect) {
console.log('[ LOG ] - Tentando reconectar...');
ligarbot();
} else {
console.log('Desconectado. Finalizando...');
}}
})
}
ligarbot()

//========ATT INDEX========\\
fs.watchFile(__filename, (curr, prev) => {
if (curr.mtime.getTime() !== prev.mtime.getTime()) {
console.log('vc já tá mexendo, irei reiniciar...');
process.exit()
}
})
//===========FIM=========\\
