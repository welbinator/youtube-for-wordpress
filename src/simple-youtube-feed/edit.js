import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, ToggleControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
    const {
        layout = 'grid',
        maxVideos = 5,
        selectedPlaylist = '',
        enableSearch = false,
        enablePlaylistFilter = false,
        channelId
    } = attributes;

    const [playlists, setPlaylists] = useState([]);

    // Fetch playlists based on the channel ID provided
    useEffect(() => {
        async function fetchPlaylists() {
            const currentChannelId = channelId || YT_FOR_WP.channelId;
            if (!currentChannelId || !YT_FOR_WP.apiKey) {
                setPlaylists([{ label: __('Please configure YouTube API settings', 'yt-for-wp'), value: '' }]);
                return;
            }
            try {
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${currentChannelId}&maxResults=25&key=${YT_FOR_WP.apiKey}`
                );
                const data = await response.json();
    
                if (data.error) {
                    console.error('YouTube API Error:', data.error.message);
                    setPlaylists([{ label: __('Error loading playlists', 'yt-for-wp'), value: '' }]);
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
                    setPlaylists([{ label: __('No playlists found', 'yt-for-wp'), value: '' }]);
                }
            } catch (error) {
                console.error('Error fetching playlists:', error);
                setPlaylists([{ label: __('Error loading playlists', 'yt-for-wp'), value: '' }]);
            }
        }
    
        fetchPlaylists();
    }, [channelId]);

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Layout Settings', 'simple-youtube-feed')}>
                    <TextControl
                        label={__('YouTube Channel ID', 'yt-for-wp')}
                        value={channelId || YT_FOR_WP.channelId} // Default to settings if blank
                        onChange={(newChannelId) => setAttributes({ channelId: newChannelId })}
                        help={__('Leave blank to use the default Channel ID from settings.', 'yt-for-wp')}
                    />
                    <SelectControl
                        label={__('Select Layout', 'simple-youtube-feed')}
                        value={layout}
                        options={[
                            { label: __('Grid View', 'simple-youtube-feed'), value: 'grid' },
                            { label: __('List View', 'simple-youtube-feed'), value: 'list' },
                            { label: __('Carousel', 'simple-youtube-feed'), value: 'carousel' },
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
                    <ToggleControl
                        label={__('Enable User Search', 'simple-youtube-feed')}
                        checked={enableSearch}
                        onChange={(newSearchSetting) => setAttributes({ enableSearch: !!newSearchSetting })}
                    />
                    <ToggleControl
                        label={__('Enable Playlist Filter', 'simple-youtube-feed')}
                        checked={enablePlaylistFilter}
                        onChange={(newPlaylistFilter) => setAttributes({ enablePlaylistFilter: !!newPlaylistFilter })}
                    />
                </PanelBody>
            </InspectorControls>

            <p {...useBlockProps()}>
                {__('Simple YouTube Feed', 'simple-youtube-feed')}
                <br />
                {__('Channel ID:', 'simple-youtube-feed')} {channelId || YT_FOR_WP.channelId}
            </p>
        </>
    );
}
