import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } from '@discordjs/voice';
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

    const songName = args.join(' ');
    if (!songName) return message.reply('❌ Você precisa fornecer o nome da música.');

    const videoFinder = async (query) => {
        const videoResult = await ytSearch(query);
        return (videoResult.videos.length > 0) ? videoResult.videos[0] : null;
    };

    const video = await videoFinder(songName);

    if (!video) {
        return message.reply('❌ Música não encontrada.');
    }

    const song = {
        title: video.title,
        url: video.url
    };

    let queue = client.queues.get(message.guild.id);

    if (!queue) {
        queue = {
            voiceChannel,
            connection: null,
            songs: [],
            player: createAudioPlayer()
        };

        client.queues.set(message.guild.id, queue);

        queue.songs.push(song);

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            queue.connection = connection;
            connection.subscribe(queue.player);

            playSong(message.guild, queue.songs[0], client, message);

        } catch (err) {
            console.log(err);
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

    const stream = ytdl(song.url, { filter: 'audioonly' });
    const resource = createAudioResource(stream);

    queue.player.play(resource);

    const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`🎶 Tocando agora: ${song.title}`)
        .setURL(song.url)
        .setDescription('Aproveite a música!')
        .setThumbnail('https://i.ytimg.com/vi/' + song.url.split('v=')[1] + '/hqdefault.jpg')
        .setFooter({ text: 'Bot Music feito por VOCÊ 😎' });

    message.channel.send({ embeds: [embed] });

    queue.player.on(AudioPlayerStatus.Idle, () => {
        queue.songs.shift();
        playSong(guild, queue.songs[0], client, message);
    });

    queue.player.on('error', error => {
        console.error(error);
        queue.songs.shift();
        playSong(guild, queue.songs[0], client, message);
    });
}
