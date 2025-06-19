import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';
import { EmbedBuilder } from 'discord.js';

export const name = 'play';

export async function execute(message, args, client) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('❌ Você precisa estar em um canal de voz!');

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
        return message.reply('❌ Eu preciso de permissões para entrar e falar no seu canal!');
    }

    const query = args.join(' ');
    if (!query) {
        return message.reply('❌ Você precisa fornecer o nome da música ou link!');
    }

    let song = null;

    if (ytdl.validateURL(query)) {
        const songInfo = await ytdl.getInfo(query);
        song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        };
    } else {
        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);
            return (videoResult.videos.length > 0) ? videoResult.videos[0] : null;
        };

        const video = await videoFinder(query);

        if (video) {
            song = {
                title: video.title,
                url: video.url
            };
        } else {
            return message.reply('❌ Música não encontrada.');
        }
    }

    let queue = client.queues.get(message.guild.id);

    if (!queue) {
        queue = {
            voiceChannel,
            connection: null,
            songs: [],
            player: createAudioPlayer()
        };

        client.queues.set(message.guild.id, queue);

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            });

            queue.connection = connection;
            connection.subscribe(queue.player);

            queue.songs.push(song);
            playSong(message.guild, queue.songs[0], client, message);

        } catch (err) {
            console.error(err);
            client.queues.delete(message.guild.id);
            return message.reply('❌ Erro ao conectar no canal de voz.');
        }

    } else {
        queue.songs.push(song);
        return message.reply(`✅ **${song.title}** foi adicionada na fila.`);
    }
}

function playSong(guild, song, client, message) {
    const queue = client.queues.get(guild.id);

    if (!song) {
        queue.connection.destroy();
        client.queues.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, {
        filter: 'audioonly',
        highWaterMark: 1 << 25,
        quality: 'highestaudio'
    });

    const resource = createAudioResource(stream);

    queue.player.play(resource);

    const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`🎶 Tocando agora: ${song.title}`)
        .setURL(song.url)
        .setDescription('Aproveite a música!')
        .setFooter({ text: 'Bot Music feito por VOCÊ 😎' });

    message.channel.send({ embeds: [embed] });

    queue.player.once(AudioPlayerStatus.Idle, () => {
        queue.songs.shift();
        playSong(guild, queue.songs[0], client, message);
    });

    queue.player.on('error', error => {
        console.error('Erro no player:', error);
        queue.songs.shift();
        playSong(guild, queue.songs[0], client, message);
    });
}
