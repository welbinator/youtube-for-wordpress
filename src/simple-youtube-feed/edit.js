import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { doAction } from '@wordpress/hooks';

export default function Edit({ attributes, setAttributes }) {
    const {
        layout = 'grid',
        maxVideos = 5,
        selectedPlaylist = '',
    } = attributes;

    const [playlists, setPlaylists] = useState([]);

    // Fetch playlists (using global YT_FOR_WP channelId)
    useEffect(() => {
        async function fetchPlaylists() {
            const currentChannelId = YT_FOR_WP.channelId;
            if (!currentChannelId || !YT_FOR_WP.apiKey) {
                setPlaylists([{ label: __('Please configure YouTube API settings', 'toolkit-integration-for-youtube'), value: '' }]);
                return;
            }
            try {
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${currentChannelId}&maxResults=25&key=${YT_FOR_WP.apiKey}`
                );
                const data = await response.json();

                if (data.error) {
                    console.error('YouTube API Error:', data.error.message);
                    setPlaylists([{ label: __('Error loading playlists', 'toolkit-integration-for-youtube'), value: '' }]);
                    return;
                }

                if (data.items) {
                    setPlaylists([
                        { label: __('All Videos', 'simple-youtube-feed'), value: '' },
                        ...data.items.map((playlist) => ({
                            label: playlist.snippet.title,
                            value: playlist.id,
                        })),
                    ]);
                } else {
                    setPlaylists([{ label: __('No playlists found', 'toolkit-integration-for-youtube'), value: '' }]);
                }
            } catch (error) {
                console.error('Error fetching playlists:', error);
                setPlaylists([{ label: __('Error loading playlists', 'toolkit-integration-for-youtube'), value: '' }]);
            }
        }

        fetchPlaylists();
    }, []);

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Layout Settings', 'simple-youtube-feed')}>
                    <SelectControl
                        label={__('Select Layout', 'simple-youtube-feed')}
                        value={layout}
                        options={[
                            { label: __('Grid View', 'simple-youtube-feed'), value: 'grid' },
                            { label: __('List View', 'simple-youtube-feed'), value: 'list' },
                            { label: __('Carousel', 'simple-youtube-feed'), value: 'carousel' },
                            { label: __('Gallery View', 'simple-youtube-feed'), value: 'gallery' },
                        ]}
                        onChange={(newLayout) => setAttributes({ layout: newLayout })}
                    />
                    <TextControl
                        label={__('Number of videos to display', 'simple-youtube-feed')}
                        type="number"
                        min={1}
                        max={50}
                        value={maxVideos}
                        onChange={(newMax) => setAttributes({ maxVideos: parseInt(newMax, 10) || 1 })}
                    />
                </PanelBody>
            </InspectorControls>

            {doAction('yt_for_wp_simple_feed_editor_controls', attributes, setAttributes)}

            <p {...useBlockProps()}>
                {__('Simple YouTube Feed', 'simple-youtube-feed')}
            </p>
        </>
    );
}
