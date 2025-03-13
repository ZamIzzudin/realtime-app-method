import { IoChatboxEllipsesSharp } from 'react-icons/io5';

export default function UserList({
  handlerJoin,
  handlerMenu,
  activeUsers,
  username,
  notifications,
}: any) {
  return (
    <div className="h-fit flex flex-col gap-2 grow">
      {activeUsers.length <= 1 ? (
        <div className=" flex grow justify-center items-center">
          <h1>No User Active Yet</h1>
        </div>
      ) : (
        activeUsers.map(
          (user: string, index: number) =>
            user !== username && (
              <div
                className="bg-white px-4 py-3 flex justify-between items-center"
                key={index}
              >
                <div className="flex gap-3 items-center relative">
                  <div className="bg-orange-400 h-[30px] w-[30px] flex items-center justify-center rounded-full text-white">
                    {user[0]}
                  </div>
                  <span>{user}</span>

                  {Object.keys(notifications).length !== 0 && (
                    <div className="absolute top-[-25] left-[-25] bg-red-500 w-[25px] h-[25px] rounded-full flex items-center justify-center text-white">
                      {notifications[user]}
                    </div>
                  )}
                </div>

                <button
                  className="bg-orange-500 rounded p-2 text-white flex text-[18px] justify-center items-center"
                  onClick={() => {
                    handlerJoin(user);
                    handlerMenu('room');
                  }}
                >
                  <IoChatboxEllipsesSharp />
                </button>
              </div>
            )
        )
      )}
    </div>
  );
}
