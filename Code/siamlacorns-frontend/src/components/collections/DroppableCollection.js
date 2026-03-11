// components/collections/DroppableCollection.js
import React from 'react';
import { useDrop } from 'react-dnd';

const DroppableCollection = ({ collectionType, children, onDrop }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: 'LACORN',
        drop: (item) => onDrop(item, collectionType),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    return (
        <div
            ref={drop}
            className={`collection-container ${isOver ? 'drop-target' : ''} ${canDrop ? 'can-drop' : ''}`}
        >
            {children}
            {isOver && <div className="drop-indicator">Переместить сюда</div>}
        </div>
    );
};

export default DroppableCollection;