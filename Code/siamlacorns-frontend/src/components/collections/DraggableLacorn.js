// components/collections/DraggableLacorn.js
import React from 'react';
import { useDrag } from 'react-dnd';
import { Link } from 'react-router-dom';

const DraggableLacorn = ({ lacorn, collectionType }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'LACORN',
        item: { id: lacorn.id, title: lacorn.title, fromCollection: collectionType },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className={`lacorn-item ${isDragging ? 'dragging' : ''}`}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <Link to={`/lacorns/${lacorn.id}`}>
                <div className="lacorn-poster">
                    <img src={lacorn.posterUrl} alt={lacorn.title} />
                </div>
                <h3>{lacorn.title}</h3>
            </Link>
        </div>
    );
};

export default DraggableLacorn;