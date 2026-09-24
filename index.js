require('dotenv').config();
const http = require('http');
const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    EmbedBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

// 1. Keep-Alive Server for Render Hosting
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('South Wales RP Application Bot Operational.');
    res.end();
}).listen(PORT, () => {
    console.log(`Render HTTP listener running on port ${PORT}`);
});

// 2. Initialize Discord Client
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages
    ] 
});

const commands = [
    new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Post staff and media application panels')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// -------------------------------------------------------------
// Pre-built Modals in Memory (<100ms response time)
// -------------------------------------------------------------
const ageCheckInput = new TextInputBuilder()
    .setCustomId('q1_age_check')
    .setLabel('Confirm you are 13 or older (Type Y)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Y')
    .setMaxLength(3)
    .setRequired(true);

const modals = {
    // Media & Content Roles
    media: new ModalBuilder().setCustomId('modal_app_media').setTitle('Media Team Application').addComponents(
        new ActionRowBuilder().addComponents(ageCheckInput),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q2')
                .setLabel('What content do you create?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., TikTok edits, YouTube videos, Banners')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q3')
                .setLabel('Link to your channel / portfolio')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('https://...')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q4')
                .setLabel('How often can you post server content?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., 2-3 clips a week')
                .setRequired(true)
        )
    ),
    creator: new ModalBuilder().setCustomId('modal_app_creator').setTitle('Content Creator Application').addComponents(
        new ActionRowBuilder().addComponents(ageCheckInput),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q2')
                .setLabel('Streaming or main platform link')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Twitch, YouTube, TikTok link')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q3')
                .setLabel('Average live viewers or video views')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., 5-10 viewers / 500 views per clip')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q4')
                .setLabel('Will you tag/credit the server?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Yes / No')
                .setRequired(true)
        )
    ),

    // Standard Staff Roles
    tmod: new ModalBuilder().setCustomId('modal_app_tmod').setTitle('Trial Moderator Application').addComponents(
        new ActionRowBuilder().addComponents(ageCheckInput),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q2')
                .setLabel('Why do you want to join our staff team?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Tell us briefly why you want to help out.')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q3')
                .setLabel('How active are you on Discord & server?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., Active daily')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q4')
                .setLabel('Any previous staff experience?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., Mod in 1 server / None')
                .setRequired(true)
        )
    ),
    mod: new ModalBuilder().setCustomId('modal_app_mod').setTitle('Moderator Application').addComponents(
        new ActionRowBuilder().addComponents(ageCheckInput),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q2')
                .setLabel('Why do you want to be a Moderator?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Explain why you fit this role.')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q3')
                .setLabel('How do you handle rule breakers / FailRP?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Keep calm, warn them, call high staff if needed...')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q4')
                .setLabel('Weekly activity (Hours/week)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., 10-15 hours')
                .setRequired(true)
        )
    ),
    admin: new ModalBuilder().setCustomId('modal_app_admin').setTitle('Administrator Application').addComponents(
        new ActionRowBuilder().addComponents(ageCheckInput),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q2')
                .setLabel('Why apply for Admin instead of Mod?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('What leadership qualities do you bring?')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q3')
                .setLabel('How do you handle argument in staff sits?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('De-escalate calmly and stay fair.')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q4')
                .setLabel('Weekly activity commitment')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., 10+ hours per week')
                .setRequired(true)
        )
    ),
    sradmin: new ModalBuilder().setCustomId('modal_app_sradmin').setTitle('Senior Admin Application').addComponents(
        new ActionRowBuilder().addComponents(ageCheckInput),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q2')
                .setLabel('Previous staff leadership experience?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('List roles or experience in other communities.')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q3')
                .setLabel('How will you support lower staff members?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Help guide them, handle escalations, etc.')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q4')
                .setLabel('Can you maintain high daily activity?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Yes / No')
                .setRequired(true)
        )
    ),
    headstaff: new ModalBuilder().setCustomId('modal_app_headstaff').setTitle('Head of Staff Application').addComponents(
        new ActionRowBuilder().addComponents(ageCheckInput),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q2')
                .setLabel('What is your main goal for the staff team?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Briefly outline your vision.')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q3')
                .setLabel('How will you help train new staff?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Explain your approach simply.')
                .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('q4')
                .setLabel('Can you maintain high daily activity?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Yes / No')
                .setRequired(true)
        )
    )
};

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('SUCCESS: /panel registered to guild.');
    } catch (err) {
        console.error('Command registration error:', err);
    }
});

client.on('interactionCreate', async (interaction) => {

    // -------------------------------------------------------------
    // Execute /panel Command
    // -------------------------------------------------------------
    if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
        await interaction.deferReply({ ephemeral: true });

        // Content & Media Panels
        const mediaEmbed = new EmbedBuilder().setTitle('🎬 Media Team').setDescription('**Requirements:** Age 13+\nCreate video edits, TikToks, graphics, and promo content for South Wales RP.').setColor('#ff0055');
        const mediaBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_app_media').setLabel('Apply for Media Team').setStyle(ButtonStyle.Primary));

        const creatorEmbed = new EmbedBuilder().setTitle('📡 Content Creator').setDescription('**Requirements:** Age 13+\nStream or upload South Wales RP roleplay gameplay to your channels.').setColor('#ff4400');
        const creatorBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_app_creator').setLabel('Apply for Content Creator').setStyle(ButtonStyle.Success));

        // Staff Panels
        const tmodEmbed = new EmbedBuilder().setTitle('🔰 Trial Moderator').setDescription('**Requirements:** Age 13+ • Active\nEntry-level moderation role.').setColor('#00ffff');
        const tmodBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_app_tmod').setLabel('Apply for Trial Mod').setStyle(ButtonStyle.Primary));

        const modEmbed = new EmbedBuilder().setTitle('🛡️ Moderator').setDescription('**Requirements:** Age 13+ • Active\nFull moderation duties.').setColor('#00ff88');
        const modBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_app_mod').setLabel('Apply for Moderator').setStyle(ButtonStyle.Success));

        const adminEmbed = new EmbedBuilder().setTitle('👑 Administrator').setDescription('**Requirements:** Age 13+ • Active\nSenior server oversight.').setColor('#ffbb00');
        const adminBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_app_admin').setLabel('Apply for Admin').setStyle(ButtonStyle.Secondary));

        const srAdminEmbed = new EmbedBuilder().setTitle('⚡ Senior Administrator').setDescription('**Requirements:** Age 13+ • Active\nHigh-level server leadership.').setColor('#ff5500');
        const srAdminBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_app_sradmin').setLabel('Apply for Sr. Admin').setStyle(ButtonStyle.Danger));

        const headStaffEmbed = new EmbedBuilder().setTitle('🌟 Head of Staff').setDescription('**Requirements:** Age 13+ • Active\nStaff team management.').setColor('#aa00ff');
        const headStaffBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_app_headstaff').setLabel('Apply for Head of Staff').setStyle(ButtonStyle.Primary));

        // Dispatch Panels
        await interaction.channel.send({ embeds: [mediaEmbed], components: [mediaBtn] });
        await interaction.channel.send({ embeds: [creatorEmbed], components: [creatorBtn] });
        await interaction.channel.send({ embeds: [tmodEmbed], components: [tmodBtn] });
        await interaction.channel.send({ embeds: [modEmbed], components: [modBtn] });
        await interaction.channel.send({ embeds: [adminEmbed], components: [adminBtn] });
        await interaction.channel.send({ embeds: [srAdminEmbed], components: [srAdminBtn] });
        await interaction.channel.send({ embeds: [headStaffEmbed], components: [headStaffBtn] });

        await interaction.editReply({ content: 'All application panels deployed successfully!' });
    }

    // -------------------------------------------------------------
    // Direct Button Clicks -> Instant Modal
    // -------------------------------------------------------------
    else if (interaction.isButton() && interaction.customId.startsWith('btn_app_')) {
        const role = interaction.customId.replace('btn_app_', '');
        const selectedModal = modals[role];

        if (selectedModal) {
            return interaction.showModal(selectedModal).catch(err => console.error('Modal popup error:', err));
        }
    }

    // -------------------------------------------------------------
    // Modal Submissions
    // -------------------------------------------------------------
    else if (interaction.isModalSubmit()) {
        const ageCheck = interaction.fields.getTextInputValue('q1_age_check').trim().toLowerCase();

        if (!['y', 'yes', '✓', 'check'].includes(ageCheck)) {
            return interaction.reply({ 
                content: '❌ **Application Denied:** You must confirm that you are 13 years of age or older (by typing Y) to apply at South Wales RP.',
                ephemeral: true 
            });
        }

        await interaction.reply({ 
            content: '⏳ Processing your application... Sent to management for review!', 
            ephemeral: true 
        });

        let roleTitle = '';
        if (interaction.customId === 'modal_app_media') roleTitle = '🎬 Media Team Application';
        else if (interaction.customId === 'modal_app_creator') roleTitle = '📡 Content Creator Application';
        else if (interaction.customId === 'modal_app_tmod') roleTitle = '🔰 Trial Moderator Application';
        else if (interaction.customId === 'modal_app_mod') roleTitle = '🛡️ Moderator Application';
        else if (interaction.customId === 'modal_app_admin') roleTitle = '👑 Administrator Application';
        else if (interaction.customId === 'modal_app_sradmin') roleTitle = '⚡ Senior Administrator Application';
        else if (interaction.customId === 'modal_app_headstaff') roleTitle = '🌟 Head of Staff Application';

        const fields = [
            { name: 'Applicant', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
            { name: 'User ID', value: interaction.user.id, inline: true },
            { name: '13+ Confirmed', value: '✅ YES', inline: true }
        ];

        let i = 2;
        interaction.fields.fields.forEach(field => {
            if (field.customId !== 'q1_age_check') {
                fields.push({ name: `Answer ${i}`, value: field.value || 'N/A' });
                i++;
            }
        });

        const appEmbed = new EmbedBuilder()
            .setTitle(`Review Required: ${roleTitle}`)
            .setColor('#0099ff')
            .addFields(fields)
            .setFooter({ text: 'South Wales RP • Application Review' })
            .setTimestamp();

        const reviewButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`accept_${interaction.user.id}`).setLabel('Accept').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`decline_${interaction.user.id}`).setLabel('Decline').setStyle(ButtonStyle.Danger)
        );

        try {
            const owner = await client.users.fetch(process.env.OWNER_ID);
            await owner.send({ embeds: [appEmbed], components: [reviewButtons] });
        } catch (err) {
            console.error('Failed to DM owner:', err);
        }
    }

    // -------------------------------------------------------------
    // Accept / Decline Decision Actions
    // -------------------------------------------------------------
    else if (interaction.isButton() && (interaction.customId.startsWith('accept_') || interaction.customId.startsWith('decline_'))) {
        await interaction.deferReply({ ephemeral: true });

        const [action, applicantId] = interaction.customId.split('_');

        try {
            const applicant = await client.users.fetch(applicantId);
            const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);

            if (action === 'accept') {
                originalEmbed.setColor('#00ff00').setTitle(`${originalEmbed.data.title} — [ACCEPTED]`);
                await applicant.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🎉 Application Accepted — South Wales Roleplay')
                            .setDescription('Congratulations! Your application for **South Wales RP** has been **ACCEPTED**.\n\nPlease contact server management in Discord to get set up with your roles.')
                            .setColor('#00ff00')
                            .setTimestamp()
                    ]
                });
                await interaction.message.edit({ embeds: [originalEmbed], components: [] });
                await interaction.editReply({ content: `✅ Application accepted. DM sent to <@${applicantId}>.` });
            } else if (action === 'decline') {
                originalEmbed.setColor('#ff0000').setTitle(`${originalEmbed.data.title} — [DECLINED]`);
                await applicant.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Application Update — South Wales Roleplay')
                            .setDescription('Hello,\n\nThank you for applying to **South Wales RP**. Unfortunately, your application was not accepted at this time.\n\nYou are welcome to re-apply in the future.')
                            .setColor('#ff0000')
                            .setTimestamp()
                    ]
                });
                await interaction.message.edit({ embeds: [originalEmbed], components: [] });
                await interaction.editReply({ content: `❌ Application declined. DM sent to <@${applicantId}>.` });
            }
        } catch (err) {
            console.error('Error handling decision:', err);
            await interaction.editReply({ content: '⚠️ Decision updated, but unable to DM applicant (User DMs may be closed).' });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
