import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, ToggleControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
    const { layout = 'grid', maxVideos = 5, selectedPlaylist = '', enableSearch = false, enablePlaylistFilter = false } = attributes;
    const [playlists, setPlaylists] = useState([]);

    // Fetch playlists based on the channel ID provided
    useEffect(() => {
        async function fetchPlaylists() {
            if (!YT_FOR_WP.channelId || !YT_FOR_WP.apiKey) {
                console.warn('Channel ID or API Key is missing.');
                return;
            }
            try {
                const response = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${YT_FOR_WP.channelId}&maxResults=25&key=${YT_FOR_WP.apiKey}`);
                const data = await response.json();

                if (data.items) {
                    setPlaylists([
                        { label: __('All Videos', 'simple-youtube-feed'), value: '' }, // Default option
                        ...data.items.map(playlist => ({
                            label: playlist.snippet.title,
                            value: playlist.id,
                        })),
                    ]);
                } else {
                    console.warn('No playlists found or API quota exceeded.');
                }
            } catch (error) {
                console.error('Error fetching playlists:', error);
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
                        onChange={(newSearchSetting) => setAttributes({ enableSearch: newSearchSetting })}
                    />
                    <ToggleControl
                        label={__('Enable Playlist Filter', 'simple-youtube-feed')}
                        checked={enablePlaylistFilter}
                        onChange={(newPlaylistFilter) => setAttributes({ enablePlaylistFilter: newPlaylistFilter })}
                    />
                </PanelBody>
            </InspectorControls>

            <p {...useBlockProps()}>
                {__('Simple YouTube Feed', 'simple-youtube-feed')}
            </p>
        </>
    );
}
