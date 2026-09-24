require('dotenv').config();
const http = require('http');
const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    EmbedBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

// 1. Keep-Alive HTTP Server for Render Hosting
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('South Wales RP Staff Application Bot Active.');
    res.end();
}).listen(PORT, () => {
    console.log(`Render HTTP listener running on port ${PORT}`);
});

// 2. Discord Client Setup
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages
    ] 
});

const commands = [
    new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Post the South Wales RP Staff Recruitment panel')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    try {
        console.log('Registering /panel command...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('SUCCESS: /panel registered instantly to your server!');
    } catch (err) {
        console.error('Failed to register slash command:', err);
    }
});

client.on('interactionCreate', async (interaction) => {

    // -------------------------------------------------------------
    // Execute /panel Command
    // -------------------------------------------------------------
    if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
        const embed = new EmbedBuilder()
            .setTitle('🏴󠁧󠁢󠁷󠁬󠁳󠁿 South Wales Roleplay — Staff Recruitment Panel')
            .setDescription('We are currently looking to fill all staff positions across the server!\n\n**Staff Requirements:**\n• You must be **13 years of age or older**.\n• You must be active and willing to enforce server rules fairly.\n\nSelect the staff role you wish to apply for from the dropdown menu below.')
            .setColor('#00ffcc')
            .setFooter({ text: 'South Wales RP • Staff Applications' })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('app_select_menu')
            .setPlaceholder('Choose a staff role to apply for...')
            .addOptions([
                {
                    label: 'Trial Moderator',
                    description: 'Entry-level staff role (Age 13+ & Active)',
                    value: 'app_tmod',
                    emoji: '🔰'
                },
                {
                    label: 'Moderator',
                    description: 'Full moderation team (Age 13+ & Active)',
                    value: 'app_mod',
                    emoji: '🛡️'
                },
                {
                    label: 'Administrator',
                    description: 'Senior management team (Age 13+ & Active)',
                    value: 'app_admin',
                    emoji: '👑'
                },
                {
                    label: 'Senior Administrator',
                    description: 'High-level server oversight (Age 13+ & Active)',
                    value: 'app_sradmin',
                    emoji: '⚡'
                },
                {
                    label: 'Head of Staff',
                    description: 'Managing staff team & recruitment (Age 13+ & Active)',
                    value: 'app_headstaff',
                    emoji: '🌟'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ content: 'Staff application panel deployed!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    }

    // -------------------------------------------------------------
    // Menu Dropdowns -> 5-Question Modals (with 13+ Check Box)
    // -------------------------------------------------------------
    else if (interaction.isStringSelectMenu() && interaction.customId === 'app_select_menu') {
        const selected = interaction.values[0];

        // Shared 13+ confirmation input box
        const ageCheckInput = new TextInputBuilder()
            .setCustomId('q1_age_check')
            .setLabel('1. Confirm Age: Type YES if you are 13 or older')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('YES')
            .setRequired(true);

        // 1. Trial Moderator
        if (selected === 'app_tmod') {
            const modal = new ModalBuilder()
                .setCustomId('modal_app_tmod')
                .setTitle('Trial Moderator Application');

            modal.addComponents(
                new ActionRowBuilder().addComponents(ageCheckInput),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q2_active').setLabel('2. Will you remain active daily? (Yes/No)').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q3_why').setLabel('3. Why do you want to join our staff team?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q4_failrp').setLabel('4. How do you handle a player breaking FailRP?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q5_exp').setLabel('5. Any previous staff/mod experience?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                )
            );
            await interaction.showModal(modal);
        } 
        
        // 2. Moderator
        else if (selected === 'app_mod') {
            const modal = new ModalBuilder()
                .setCustomId('modal_app_mod')
                .setTitle('Moderator Application');

            modal.addComponents(
                new ActionRowBuilder().addComponents(ageCheckInput),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q2_active').setLabel('2. Weekly activity commitment (Hours/week)').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q3_argument').setLabel('3. How do you de-escalate a heated staff sit?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q4_bias').setLabel('4. How do you ensure unbiased decisions with friends?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q5_history').setLabel('5. Detailed staff history and skills').setStyle(TextInputStyle.Paragraph).setRequired(true)
                )
            );
            await interaction.showModal(modal);
        }

        // 3. Administrator
        else if (selected === 'app_admin') {
            const modal = new ModalBuilder()
                .setCustomId('modal_app_admin')
                .setTitle('Administrator Application');

            modal.addComponents(
                new ActionRowBuilder().addComponents(ageCheckInput),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q2_active').setLabel('2. Can you dedicate 10+ active hours weekly?').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q3_qual').setLabel('3. What makes you qualified for Admin over Mod?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q4_corrupt').setLabel('4. How do you deal with corrupt or abusive staff?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q5_events').setLabel('5. How would you plan or assist server events/RP?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                )
            );
            await interaction.showModal(modal);
        }

        // 4. Senior Administrator
        else if (selected === 'app_sradmin') {
            const modal = new ModalBuilder()
                .setCustomId('modal_app_sradmin')
                .setTitle('Senior Administrator Application');

            modal.addComponents(
                new ActionRowBuilder().addComponents(ageCheckInput),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q2_active').setLabel('2. Daily activity commitment? (Yes/No)').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q3_lead').setLabel('3. Previous leadership/management experience?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q4_crisis').setLabel('4. How do you handle major server disputes/raids?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q5_improve').setLabel('5. What changes/improvements would you make?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                )
            );
            await interaction.showModal(modal);
        }

        // 5. Head of Staff
        else if (selected === 'app_headstaff') {
            const modal = new ModalBuilder()
                .setCustomId('modal_app_headstaff')
                .setTitle('Head of Staff Application');

            modal.addComponents(
                new ActionRowBuilder().addComponents(ageCheckInput),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q2_active').setLabel('2. Confirm high daily activity (Yes/No)').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q3_manage').setLabel('3. How will you recruit & train new staff?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q4_eval').setLabel('4. How will you evaluate staff activity/duty?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('q5_vision').setLabel('5. What is your vision for South Wales RP staff?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                )
            );
            await interaction.showModal(modal);
        }
    }

    // -------------------------------------------------------------
    // Modal Submissions -> Check 13+ Confirmation & DM Owner
    // -------------------------------------------------------------
    else if (interaction.isModalSubmit()) {
        const ageCheck = interaction.fields.getTextInputValue('q1_age_check').trim().toLowerCase();

        // 13+ Confirmation Check
        if (ageCheck !== 'yes' && ageCheck !== 'y') {
            return interaction.reply({ 
                content: '❌ **Application Denied:** You must confirm that you are 13 years of age or older (by typing YES) to apply for staff at South Wales RP.', 
                ephemeral: true 
            });
        }

        let staffRole = '';
        const fields = [
            { name: 'Applicant', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
            { name: 'User ID', value: interaction.user.id, inline: true },
            { name: '13+ Confirmed', value: '✅ YES', inline: true }
        ];

        if (interaction.customId === 'modal_app_tmod') {
            staffRole = '🔰 Trial Moderator Application';
            fields.push(
                { name: 'Daily Activity', value: interaction.fields.getTextInputValue('q2_active') },
                { name: 'Motivation', value: interaction.fields.getTextInputValue('q3_why') },
                { name: 'FailRP Handling', value: interaction.fields.getTextInputValue('q4_failrp') },
                { name: 'Previous Experience', value: interaction.fields.getTextInputValue('q5_exp') }
            );
        } else if (interaction.customId === 'modal_app_mod') {
            staffRole = '🛡️ Moderator Application';
            fields.push(
                { name: 'Weekly Availability', value: interaction.fields.getTextInputValue('q2_active') },
                { name: 'De-escalation', value: interaction.fields.getTextInputValue('q3_argument') },
                { name: 'Unbiased Decision Making', value: interaction.fields.getTextInputValue('q4_bias') },
                { name: 'Staff History', value: interaction.fields.getTextInputValue('q5_history') }
            );
        } else if (interaction.customId === 'modal_app_admin') {
            staffRole = '👑 Administrator Application';
            fields.push(
                { name: 'Weekly Hours', value: interaction.fields.getTextInputValue('q2_active') },
                { name: 'Admin Qualifications', value: interaction.fields.getTextInputValue('q3_qual') },
                { name: 'Staff Abuse Handling', value: interaction.fields.getTextInputValue('q4_corrupt') },
                { name: 'Event/RP Planning', value: interaction.fields.getTextInputValue('q5_events') }
            );
        } else if (interaction.customId === 'modal_app_sradmin') {
            staffRole = '⚡ Senior Administrator Application';
            fields.push(
                { name: 'Daily Commitment', value: interaction.fields.getTextInputValue('q2_active') },
                { name: 'Leadership Experience', value: interaction.fields.getTextInputValue('q3_lead') },
                { name: 'Crisis Management', value: interaction.fields.getTextInputValue('q4_crisis') },
                { name: 'Proposed Improvements', value: interaction.fields.getTextInputValue('q5_improve') }
            );
        } else if (interaction.customId === 'modal_app_headstaff') {
            staffRole = '🌟 Head of Staff Application';
            fields.push(
                { name: 'Daily Commitment', value: interaction.fields.getTextInputValue('q2_active') },
                { name: 'Recruitment Plan', value: interaction.fields.getTextInputValue('q3_manage') },
                { name: 'Staff Evaluation', value: interaction.fields.getTextInputValue('q4_eval') },
                { name: 'Team Vision', value: interaction.fields.getTextInputValue('q5_vision') }
            );
        }

        const appEmbed = new EmbedBuilder()
            .setTitle(`Review Required: ${staffRole}`)
            .setColor('#0099ff')
            .addFields(fields)
            .setFooter({ text: 'South Wales RP • Staff Management Review' })
            .setTimestamp();

        const reviewButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`accept_${interaction.user.id}`)
                .setLabel('Accept Application')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`decline_${interaction.user.id}`)
                .setLabel('Decline Application')
                .setStyle(ButtonStyle.Danger)
        );

        try {
            const owner = await client.users.fetch(process.env.OWNER_ID);
            await owner.send({ embeds: [appEmbed], components: [reviewButtons] });
            await interaction.reply({ 
                content: '✅ Your staff application has been submitted to management! You will receive a DM notification once reviewed.', 
                ephemeral: true 
            });
        } catch (err) {
            console.error('Failed to DM owner:', err);
            await interaction.reply({ 
                content: '⚠️ Failed to send application via DM. Please check that OWNER_ID is correct and DMs are enabled.', 
                ephemeral: true 
            });
        }
    }

    // -------------------------------------------------------------
    // Accept / Decline Buttons (Direct Message Applicant)
    // -------------------------------------------------------------
    else if (interaction.isButton()) {
        const [action, applicantId] = interaction.customId.split('_');

        if (action === 'accept' || action === 'decline') {
            try {
                const applicant = await client.users.fetch(applicantId);
                const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);

                if (action === 'accept') {
                    originalEmbed.setColor('#00ff00').setTitle(`${originalEmbed.data.title} — [ACCEPTED]`);
                    
                    await applicant.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('🎉 Staff Application Accepted — South Wales Roleplay')
                                .setDescription(`Congratulations! Your staff application for **South Wales RP** has been **ACCEPTED**.\n\nPlease contact server management in Discord to begin your staff onboarding and receive your roles.`)
                                .setColor('#00ff00')
                                .setTimestamp()
                        ]
                    });

                    await interaction.update({ embeds: [originalEmbed], components: [] });
                    await interaction.followUp({ content: `✅ Staff application accepted. DM sent to <@${applicantId}>.`, ephemeral: true });

                } else if (action === 'decline') {
                    originalEmbed.setColor('#ff0000').setTitle(`${originalEmbed.data.title} — [DECLINED]`);

                    await applicant.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Staff Application Update — South Wales Roleplay')
                                .setDescription(`Hello,\n\nThank you for taking the time to apply for a staff position at **South Wales RP**. Unfortunately, your application was not accepted at this time.\n\nYou are welcome to re-apply in the future when staff applications open again.`)
                                .setColor('#ff0000')
                                .setTimestamp()
                        ]
                    });

                    await interaction.update({ embeds: [originalEmbed], components: [] });
                    await interaction.followUp({ content: `❌ Staff application declined. DM sent to <@${applicantId}>.`, ephemeral: true });
                }

            } catch (err) {
                console.error('Error sending DM:', err);
                await interaction.reply({ content: '⚠️ Status updated, but unable to DM applicant (User DMs may be closed).', ephemeral: true });
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
