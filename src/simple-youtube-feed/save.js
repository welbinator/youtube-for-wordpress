import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { layout, maxVideos, selectedPlaylist, enableSearch, enablePlaylistFilter } = attributes;

    return (
        <div
            {...useBlockProps.save()}
            data-layout={layout}
            data-max-videos={maxVideos}
            data-selected-playlist={selectedPlaylist}
            data-enable-search={enableSearch ? 'true' : 'false'} 
            data-enable-playlist-filter={enablePlaylistFilter ? 'true' : 'false'} // Ensures string consistency
            id="youtube-feed-container"
        ></div>
    );
}
