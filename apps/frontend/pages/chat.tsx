import ChatRoom from '../components/ChatRoom';
import LeftServersBar from '../components/LeftServersBar';
import ChannelsSidebar from '../components/ChannelsSidebar';
import MembersPanel from '../components/MembersPanel';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-[#050607] text-slate-100">
      <div className="mx-auto max-w-7xl grid grid-cols-[64px_224px_1fr_256px] gap-6 py-8 px-6">
        <LeftServersBar />
        <ChannelsSidebar />
        <main>
          <ChatRoom />
        </main>
        <MembersPanel />
      </div>
    </div>
  );
}

