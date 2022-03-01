export const reorder = (list, startIndex, endIndex) => {
    const items = Array.from(list);
    const [reorderedItem] = items.splice(startIndex, 1);
    items.splice(endIndex, 0, reorderedItem);
    return items
}
export const convertIntoSingleArray = (obj) => {
    const arr = [];
    Object.entries(obj).map(([k,v]) => {
        for(let i in v) {
            arr.push(v[i]);
        }
    });
    return arr
}
export const spliceIntoChunks = (arr, chunkSize) => {
    let res = {};
    for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
        res[i] = chunk.map(i => i) ;
    }

    return res;
}


export const reorderData = (data, source, destination, column) => {
    console.log(data, source, destination, column);
    const current = [...data[source.droppableId]];
    const next = [...data[destination.droppableId]];
    const target = current[source.index];
    // moving to same list
    if (source.droppableId === destination.droppableId) {
        console.log("hello ");
        const reordered = reorder(current, source.index, destination.index);
        return {
            ...data,
            [source.droppableId]: reordered
        };
    }
    if (destination.index == column) {
        return data;
    }
    // moving to different list

    // remove from original
    current.splice(source.index, 1);
    // insert into next
    next.splice(destination.index, 0, target);
    // if (next.length > column) {
    //     console.log("c ", current);
    //     console.log("n ", next);
    //     let newList = {
    //         ...data,
    //         [source.droppableId]: current,
    //         [destination.droppableId]: next
    //     };

    // }

    let newList = {
        ...data,
        [source.droppableId]: current,
        [destination.droppableId]: next
    };
    return spliceIntoChunks(convertIntoSingleArray(newList), 3);
}

export const reorderNEW = (list, startIndex, endIndex) => {
    console.log(list, startIndex, endIndex);
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };