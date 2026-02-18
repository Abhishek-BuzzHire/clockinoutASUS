const Pagination = () => {
  return (
    <div className=''>
      <div className="p-4 flex items-center justify-between text-gray-500">
        <button
          disabled
          className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <div className="flex items-center gap-2 text-sm">
          <button className="px-2 rounded-sm bg-lamaSky">1</button>
          <button className="px-2 rounded-sm ">2</button>
          <button className="px-2 rounded-sm ">3</button>
          ...
          <button className="px-2 rounded-sm ">10</button>
        </div>
        <button className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination


// type PaginationProps = {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
// };

// const Pagination = ({
//   currentPage,
//   totalPages,
//   onPageChange
// }: PaginationProps) => {
//   return (
//     <div className="p-4 flex items-center justify-between text-gray-500">

//       {/* Prev Button */}
//       <button
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         Prev
//       </button>

//       {/* Page Numbers */}
//       <div className="flex items-center gap-2 text-sm">
//         {Array.from({ length: totalPages }, (_, i) => {
//           const page = i + 1;

//           return (
//             <button
//               key={page}
//               onClick={() => onPageChange(page)}
//               className={`px-3 py-1 rounded-sm ${currentPage === page
//                   ? "bg-lamaSky text-white"
//                   : "hover:bg-slate-200"
//                 }`}
//             >
//               {page}
//             </button>
//           );
//         })}
//       </div>

//       {/* Next Button */}
//       <button
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         Next
//       </button>

//     </div>
//   );
// };

// export default Pagination;
