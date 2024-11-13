import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { layout } = attributes;

    return (
        <div {...useBlockProps.save()} data-layout={layout} id="youtube-feed-container"></div>
    );
}
