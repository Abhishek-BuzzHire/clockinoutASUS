const Table = ({
    columns,
    renderRow,
    data,
}: {
    columns: { header: string; accessor: string; className?: string }[];
    renderRow: (item: any) => React.ReactNode;
    data: any[];
}) => {
    return (
        <table className="w-full mt-0">
            <thead>
                <tr className="text-left text-gray-600 bg-white text-sm shadow-md">
                    {columns.map((col) => (
                        <th key={col.accessor} className={col.className}>
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {(Array.isArray(data) ? data : [])
                    .filter(Boolean)
                    .map((item) => renderRow(item))}
            </tbody>
        </table>
    );
};

export default Table;