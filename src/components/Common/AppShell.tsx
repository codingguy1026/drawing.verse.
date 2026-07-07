"use client";

import { Box } from "@devup-ui/react";
import TabsNav from "@/components/Common/TabsNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box bg="$background" color="$text" minH="100vh">
      <TabsNav />

      {/* 네브바가 fixed라서 padding-top 필수 (공백/겹침 방지) */}
      <Box pt={24} px={[4, 5, 6]} pb={10}>
        <Box maxW="1120px" mx="auto">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
