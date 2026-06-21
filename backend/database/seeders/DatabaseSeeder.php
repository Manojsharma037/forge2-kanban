<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\BoardList;
use App\Models\Card;
use App\Models\Member;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with a demo Kanban board.
     */
    public function run(): void
    {
        // No users/auth in this app; seed only the demo Kanban board.
        // (The default UserFactory uses fake(), which isn't available in a
        //  --no-dev production install — so we avoid it entirely.)
        $board = Board::create([
            'name'        => 'Product Roadmap',
            'description' => 'Forge 2 demo board — track work across the team.',
        ]);

        $lists = collect(['To-Do', 'Doing', 'Done'])->map(
            fn ($name, $i) => $board->lists()->create(['name' => $name, 'position' => $i])
        );

        $members = collect([
            ['name' => 'Aisha Khan',   'email' => 'aisha@example.com'],
            ['name' => 'Diego Santos', 'email' => 'diego@example.com'],
            ['name' => 'Mei Lin',      'email' => 'mei@example.com'],
        ])->map(fn ($m) => Member::create($m));

        $board->members()->sync($members->pluck('id'));

        $tags = collect([
            ['name' => 'Bug',     'color' => '#ef4444'],
            ['name' => 'Feature', 'color' => '#6366f1'],
            ['name' => 'Urgent',  'color' => '#f59e0b'],
            ['name' => 'Design',  'color' => '#10b981'],
        ])->map(fn ($t) => $board->tags()->create($t));

        // To-Do
        $c = Card::create([
            'list_id'            => $lists[0]->id,
            'title'              => 'Set up CI pipeline',
            'description'        => 'GitHub Actions for backend tests and frontend build.',
            'assigned_member_id' => $members[1]->id,
            'due_date'           => now()->subDays(1)->toDateString(), // overdue
            'position'           => 0,
        ]);
        $c->tags()->sync([$tags[1]->id, $tags[2]->id]);

        $c = Card::create([
            'list_id'            => $lists[0]->id,
            'title'              => 'Fix login redirect bug',
            'description'        => 'Users land on a blank page after sign-in.',
            'assigned_member_id' => $members[0]->id,
            'due_date'           => now()->addDays(3)->toDateString(),
            'position'           => 1,
        ]);
        $c->tags()->sync([$tags[0]->id]);

        // Doing
        $c = Card::create([
            'list_id'            => $lists[1]->id,
            'title'              => 'Design board column layout',
            'description'        => 'Trello-style columns with drag-and-drop.',
            'assigned_member_id' => $members[2]->id,
            'due_date'           => now()->addDays(1)->toDateString(),
            'position'           => 0,
        ]);
        $c->tags()->sync([$tags[3]->id, $tags[1]->id]);

        // Done
        $c = Card::create([
            'list_id'     => $lists[2]->id,
            'title'       => 'Scaffold Laravel + React project',
            'description' => 'Base repo, migrations, and API resources.',
            'position'    => 0,
        ]);
        $c->tags()->sync([$tags[1]->id]);
    }
}
