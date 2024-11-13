import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
    const { layout = 'grid', maxVideos = 5 } = attributes;

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

            <p {...useBlockProps()}>
                {__('Simple YouTube Feed', 'simple-youtube-feed')}
            </p>
        </>
    );
}
